<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogItem;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Database\Seeder;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class B2UJeanCatalogSeeder extends Seeder
{
    private const DEFAULT_SITEMAP = 'https://www.b2ujean.com/wp-sitemap.xml';
    private const SOURCE_HOST = 'www.b2ujean.com';

    private array $failedUrls = [];

    public function run(): void
    {
        $sitemapUrl = trim((string) env('B2U_SOURCE_SITEMAP', self::DEFAULT_SITEMAP));
        if ($sitemapUrl === '') {
            $sitemapUrl = self::DEFAULT_SITEMAP;
        }

        $this->command?->info("B2U: leyendo sitemap {$sitemapUrl}");

        [$categoryUrls, $productUrls] = $this->discoverCatalogUrls($sitemapUrl);

        if ($productUrls === []) {
            throw new RuntimeException('B2U: el sitemap no devolvió productos. Se cancela para evitar marcar una importación vacía como completada.');
        }

        $this->command?->info(sprintf(
            'B2U: descubiertos %d URLs de categorías y %d URLs de productos.',
            count($categoryUrls),
            count($productUrls),
        ));

        $categories = $this->collectCategories($categoryUrls);
        $products = $this->collectProducts($productUrls, $categories);

        if ($this->failedUrls !== []) {
            $preview = implode(', ', array_slice(array_keys($this->failedUrls), 0, 8));
            throw new RuntimeException(sprintf(
                'B2U: quedaron %d URLs sin procesar después de todos los reintentos. Ejemplos: %s',
                count($this->failedUrls),
                $preview,
            ));
        }

        if (count($products) !== count($productUrls)) {
            throw new RuntimeException(sprintf(
                'B2U: importación incompleta: se esperaban %d productos y se prepararon %d.',
                count($productUrls),
                count($products),
            ));
        }

        DB::transaction(function () use ($categories, $products): void {
            $categoryIds = [];

            foreach ($categories as $category) {
                $model = CatalogCategory::query()->updateOrCreate(
                    ['slug' => $category['slug']],
                    [
                        'name' => $category['name'],
                        'description' => $category['description'],
                        'is_active' => true,
                    ],
                );

                $categoryIds[$category['slug']] = $model->id;
            }

            foreach ($products as $product) {
                $categoryId = null;
                if ($product['category_slug'] !== null) {
                    $categoryId = $categoryIds[$product['category_slug']] ?? null;
                }

                CatalogItem::query()->updateOrCreate(
                    ['slug' => $product['slug']],
                    [
                        'category_id' => $categoryId,
                        'type' => 'product',
                        'name' => $product['name'],
                        'reference' => $product['reference'],
                        'short_description' => $product['short_description'],
                        'description' => $product['description'],
                        'specifications' => $product['specifications'],
                        'gallery' => $product['gallery'],
                        'applications' => $product['applications'],
                        'status' => 'published',
                        'seo_title' => $product['seo_title'],
                        'seo_description' => $product['seo_description'],
                        'og_image' => $product['og_image'],
                        'whatsapp_message' => $product['whatsapp_message'],
                        'legacy_source_url' => $product['source_url'],
                        'legacy_meta' => $product['legacy_meta'],
                        'legacy_research_status' => 'completed',
                        'legacy_research_error' => null,
                        'legacy_researched_at' => now(),
                        'published_at' => now(),
                    ],
                );
            }
        });

        $this->command?->info(sprintf(
            'B2U: importación terminada. %d categorías y %d productos sincronizados.',
            count($categories),
            count($products),
        ));
    }

    private function discoverCatalogUrls(string $rootSitemap): array
    {
        $queue = [$rootSitemap];
        $seenSitemaps = [];
        $categoryUrls = [];
        $productUrls = [];

        while ($queue !== []) {
            $sitemapUrl = array_shift($queue);
            if (isset($seenSitemaps[$sitemapUrl])) {
                continue;
            }
            $seenSitemaps[$sitemapUrl] = true;

            $response = $this->get($sitemapUrl, true);
            $xml = $this->xmlDocument($response->body(), $sitemapUrl);
            $xpath = new DOMXPath($xml);
            $rootName = strtolower((string) $xml->documentElement?->localName);

            if ($rootName === 'sitemapindex') {
                foreach ($xpath->query('/*[local-name()="sitemapindex"]/*[local-name()="sitemap"]/*[local-name()="loc"]') ?: [] as $node) {
                    $url = trim((string) $node->textContent);
                    if ($this->isAllowedSourceUrl($url) && ! isset($seenSitemaps[$url])) {
                        $queue[] = $url;
                    }
                }
                continue;
            }

            if ($rootName !== 'urlset') {
                throw new RuntimeException("B2U: formato de sitemap no reconocido en {$sitemapUrl}.");
            }

            foreach ($xpath->query('/*[local-name()="urlset"]/*[local-name()="url"]/*[local-name()="loc"]') ?: [] as $node) {
                $url = $this->normalizeUrl((string) $node->textContent);
                if (! $this->isAllowedSourceUrl($url)) {
                    continue;
                }

                if (str_contains($url, '/product-category/')) {
                    $categoryUrls[$url] = true;
                } elseif (str_contains($url, '/product/')) {
                    $productUrls[$url] = true;
                }
            }
        }

        return [array_keys($categoryUrls), array_keys($productUrls)];
    }

    private function collectCategories(array $urls): array
    {
        $categories = [];

        foreach ($urls as $index => $url) {
            $response = $this->get($url);
            $dom = $this->htmlDocument($response->body());
            $xpath = new DOMXPath($dom);
            $slug = $this->categorySlugFromUrl($url);

            if ($slug === null) {
                continue;
            }

            $name = $this->firstText($xpath, '//h1') ?: Str::headline($slug);
            $description = $this->metaContent($xpath, 'description')
                ?: $this->firstText($xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " term-description ")]');

            $categories[$slug] = [
                'slug' => $slug,
                'name' => $this->cleanText($name),
                'description' => $this->nullableText($description),
            ];

            $this->progress('categorías', $index + 1, count($urls));
        }

        return $categories;
    }

    private function collectProducts(array $urls, array &$categories): array
    {
        $pending = array_values($urls);
        $products = [];
        $maxPasses = 3;

        for ($pass = 1; $pass <= $maxPasses && $pending !== []; $pass++) {
            $nextPending = [];
            $this->command?->info(sprintf(
                'B2U: pasada de productos %d/%d (%d pendientes).',
                $pass,
                $maxPasses,
                count($pending),
            ));

            foreach ($pending as $index => $url) {
                try {
                    $response = $this->get($url);
                    $products[$url] = $this->parseProduct($url, $response->body(), $categories);
                    unset($this->failedUrls[$url]);
                } catch (Throwable $exception) {
                    $nextPending[] = $url;
                    $this->failedUrls[$url] = $exception->getMessage();
                    $this->command?->warn("B2U: {$url} -> {$exception->getMessage()}");
                }

                $this->progress('productos', $index + 1, count($pending));
            }

            $pending = $nextPending;
            if ($pending !== []) {
                usleep(750000);
            }
        }

        return $products;
    }

    private function parseProduct(string $url, string $html, array &$categories): array
    {
        $dom = $this->htmlDocument($html);
        $xpath = new DOMXPath($dom);
        $schema = $this->productSchema($xpath);
        $slug = $this->productSlugFromUrl($url);

        if ($slug === null) {
            throw new RuntimeException('No se pudo determinar el slug del producto.');
        }

        $name = $this->cleanText((string) ($schema['name'] ?? $this->firstText($xpath, '//h1')));
        if ($name === '') {
            throw new RuntimeException('Producto sin nombre.');
        }

        $categoryLinks = $this->productCategoryLinks($xpath);
        $schemaCategory = $this->cleanText((string) ($schema['category'] ?? ''));

        if ($categoryLinks === [] && $schemaCategory !== '') {
            $schemaSlug = Str::slug($schemaCategory);
            if ($schemaSlug !== '') {
                $categoryLinks[$schemaSlug] = $schemaCategory;
            }
        }

        foreach ($categoryLinks as $categorySlug => $categoryName) {
            if (! isset($categories[$categorySlug])) {
                $categories[$categorySlug] = [
                    'slug' => $categorySlug,
                    'name' => $categoryName,
                    'description' => null,
                ];
            }
        }

        $primaryCategorySlug = $this->primaryCategorySlug(array_keys($categoryLinks));

        $shortDescription = $this->firstHtmlText(
            $xpath,
            '//*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-details__short-description ")]',
        );

        $description = $this->firstHtmlText(
            $xpath,
            '//*[@id="tab-description"] | //*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-Tabs-panel--description ")]',
        );

        if ($description === null) {
            $description = $this->nullableText((string) ($schema['description'] ?? ''));
        }

        if ($shortDescription === null) {
            $shortDescription = $description !== null ? Str::limit($description, 260, '') : null;
        }

        $reference = $this->cleanText((string) ($schema['sku'] ?? $this->skuFromPage($xpath)));
        $reference = $reference !== '' ? Str::limit($reference, 120, '') : null;

        [$price, $currency, $availability] = $this->offerData($schema['offers'] ?? null);
        $attributes = $this->productAttributes($xpath);
        $categoryNames = array_values($categoryLinks);

        $specifications = $attributes;
        if ($price !== null) {
            $specifications['Precio origen'] = trim(($currency ?: 'USD').' '.$price);
        }
        if ($availability !== null) {
            $specifications['Disponibilidad origen'] = $availability;
        }
        if ($categoryNames !== []) {
            $specifications['Categorías origen'] = implode(', ', $categoryNames);
        }

        $gallery = $this->productImages($schema, $xpath);
        $ogImage = $gallery[0] ?? $this->metaProperty($xpath, 'og:image');
        $seoDescription = $this->metaContent($xpath, 'description') ?: $shortDescription;
        $seoTitle = $this->metaProperty($xpath, 'og:title') ?: $name;

        return [
            'slug' => $slug,
            'category_slug' => $primaryCategorySlug,
            'name' => Str::limit($name, 190, ''),
            'reference' => $reference,
            'short_description' => $shortDescription,
            'description' => $description,
            'specifications' => $specifications !== [] ? $specifications : null,
            'gallery' => $gallery !== [] ? $gallery : null,
            'applications' => null,
            'seo_title' => Str::limit($this->cleanText($seoTitle), 190, ''),
            'seo_description' => $this->nullableText($seoDescription),
            'og_image' => $ogImage,
            'whatsapp_message' => 'Hola, quiero información sobre '.$name.($reference ? ' ('.$reference.')' : '').'.',
            'source_url' => $url,
            'legacy_meta' => [
                'source' => 'b2ujean.com',
                'source_sitemap' => env('B2U_SOURCE_SITEMAP', self::DEFAULT_SITEMAP),
                'price' => $price,
                'price_currency' => $currency,
                'availability' => $availability,
                'source_categories' => $categoryNames,
                'imported_at' => now()->toIso8601String(),
            ],
        ];
    }

    private function productSchema(DOMXPath $xpath): array
    {
        foreach ($xpath->query('//script[@type="application/ld+json"]') ?: [] as $node) {
            $json = trim((string) $node->textContent);
            if ($json === '') {
                continue;
            }

            $decoded = json_decode($json, true);
            if (! is_array($decoded)) {
                continue;
            }

            $product = $this->findSchemaType($decoded, 'Product');
            if ($product !== null) {
                return $product;
            }
        }

        return [];
    }

    private function findSchemaType(array $value, string $type): ?array
    {
        $schemaType = $value['@type'] ?? null;
        $types = is_array($schemaType) ? $schemaType : [$schemaType];

        if (in_array($type, $types, true)) {
            return $value;
        }

        foreach ($value as $child) {
            if (! is_array($child)) {
                continue;
            }

            if (array_is_list($child)) {
                foreach ($child as $item) {
                    if (is_array($item) && ($found = $this->findSchemaType($item, $type)) !== null) {
                        return $found;
                    }
                }
            } elseif (($found = $this->findSchemaType($child, $type)) !== null) {
                return $found;
            }
        }

        return null;
    }

    private function productCategoryLinks(DOMXPath $xpath): array
    {
        $result = [];
        $queries = [
            '//*[contains(concat(" ", normalize-space(@class), " "), " product_meta ")]//a[contains(@href, "/product-category/")]',
            '//*[contains(concat(" ", normalize-space(@class), " "), " posted_in ")]//a[contains(@href, "/product-category/")]',
        ];

        foreach ($queries as $query) {
            foreach ($xpath->query($query) ?: [] as $node) {
                if (! $node instanceof DOMElement) {
                    continue;
                }

                $slug = $this->categorySlugFromUrl($node->getAttribute('href'));
                $name = $this->cleanText($node->textContent);

                if ($slug !== null && $name !== '') {
                    $result[$slug] = $name;
                }
            }

            if ($result !== []) {
                break;
            }
        }

        return $result;
    }

    private function primaryCategorySlug(array $slugs): ?string
    {
        if ($slugs === []) {
            return null;
        }

        $secondary = ['nueva-coleccion', 'promocion', 'sin-categoria', 'fashion-jeans'];

        foreach ($slugs as $slug) {
            if (! in_array($slug, $secondary, true)) {
                return $slug;
            }
        }

        return $slugs[0];
    }

    private function productImages(array $schema, DOMXPath $xpath): array
    {
        $images = [];
        $schemaImages = $schema['image'] ?? [];

        if (is_string($schemaImages)) {
            $schemaImages = [$schemaImages];
        } elseif (is_array($schemaImages) && isset($schemaImages['url'])) {
            $schemaImages = [$schemaImages['url']];
        }

        if (is_array($schemaImages)) {
            foreach ($schemaImages as $image) {
                if (is_array($image)) {
                    $image = $image['url'] ?? $image['contentUrl'] ?? null;
                }

                if (is_string($image) && $this->isHttpUrl($image)) {
                    $images[$this->normalizeUrl($image)] = true;
                }
            }
        }

        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-gallery ")]//img') ?: [] as $node) {
            if (! $node instanceof DOMElement) {
                continue;
            }

            foreach (['data-large_image', 'data-lazy-src', 'data-src', 'src'] as $attribute) {
                $image = trim($node->getAttribute($attribute));
                if ($this->isHttpUrl($image)) {
                    $images[$this->normalizeUrl($image)] = true;
                    break;
                }
            }
        }

        return array_keys($images);
    }

    private function productAttributes(DOMXPath $xpath): array
    {
        $attributes = [];

        foreach ($xpath->query('//table[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-attributes ")]//tr') ?: [] as $row) {
            if (! $row instanceof DOMElement) {
                continue;
            }

            $rowXpath = new DOMXPath($row->ownerDocument);
            $labelNode = $rowXpath->query('.//th|.//td[1]', $row)?->item(0);
            $valueNode = $rowXpath->query('.//td[last()]', $row)?->item(0);
            $label = $labelNode ? $this->cleanText($labelNode->textContent) : '';
            $value = $valueNode ? $this->cleanText($valueNode->textContent) : '';

            if ($label !== '' && $value !== '' && $label !== $value) {
                $attributes[$label] = $value;
            }
        }

        return $attributes;
    }

    private function offerData(mixed $offers): array
    {
        if (! is_array($offers)) {
            return [null, null, null];
        }

        if (array_is_list($offers)) {
            $offers = $offers[0] ?? [];
        }

        if (! is_array($offers)) {
            return [null, null, null];
        }

        $price = $offers['price'] ?? $offers['lowPrice'] ?? null;
        $currency = $offers['priceCurrency'] ?? null;
        $availability = $offers['availability'] ?? null;

        if (is_string($availability) && str_contains($availability, '/')) {
            $availability = basename($availability);
        }

        return [
            is_scalar($price) ? (string) $price : null,
            is_scalar($currency) ? (string) $currency : null,
            is_scalar($availability) ? (string) $availability : null,
        ];
    }

    private function skuFromPage(DOMXPath $xpath): ?string
    {
        $node = $xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " sku ")]')?->item(0);
        return $node ? $this->nullableText($node->textContent) : null;
    }

    private function get(string $url, bool $isXml = false): Response
    {
        if (! $this->isAllowedSourceUrl($url)) {
            throw new RuntimeException("B2U: URL fuera del dominio permitido: {$url}");
        }

        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36 B2USeeder/1.0',
            'Accept' => $isXml
                ? 'application/xml,text/xml;q=0.9,*/*;q=0.8'
                : 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        ])->timeout(30)->retry(4, 750, throw: false)->get($url);

        $body = trim($response->body());
        $xmlBodyAccepted = $isXml
            && in_array($response->status(), [200, 404], true)
            && (str_contains($body, '<urlset') || str_contains($body, '<sitemapindex'));

        if ((! $response->successful() && ! $xmlBodyAccepted) || $body === '') {
            throw new RuntimeException("HTTP {$response->status()} al consultar {$url}");
        }

        usleep(90000);

        return $response;
    }

    private function xmlDocument(string $xml, string $url): DOMDocument
    {
        $dom = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $loaded = $dom->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (! $loaded) {
            throw new RuntimeException("B2U: XML inválido en {$url}");
        }

        return $dom;
    }

    private function htmlDocument(string $html): DOMDocument
    {
        $dom = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $loaded = $dom->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (! $loaded) {
            throw new RuntimeException('No se pudo interpretar el HTML de origen.');
        }

        return $dom;
    }

    private function firstText(DOMXPath $xpath, string $query): ?string
    {
        $node = $xpath->query($query)?->item(0);
        return $node ? $this->nullableText($node->textContent) : null;
    }

    private function firstHtmlText(DOMXPath $xpath, string $query): ?string
    {
        $node = $xpath->query($query)?->item(0);
        return $node ? $this->nullableText($node->textContent) : null;
    }

    private function metaContent(DOMXPath $xpath, string $name): ?string
    {
        $node = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="'.strtolower($name).'"]')?->item(0);
        return $node instanceof DOMElement ? $this->nullableText($node->getAttribute('content')) : null;
    }

    private function metaProperty(DOMXPath $xpath, string $property): ?string
    {
        $node = $xpath->query('//meta[@property="'.$property.'"]')?->item(0);
        return $node instanceof DOMElement ? $this->nullableText($node->getAttribute('content')) : null;
    }

    private function categorySlugFromUrl(string $url): ?string
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');

        if (! preg_match('#(?:^|/)product-category/([^/]+)#', $path, $matches)) {
            return null;
        }

        $slug = Str::slug(urldecode($matches[1]));
        return $slug !== '' ? $slug : null;
    }

    private function productSlugFromUrl(string $url): ?string
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');

        if (! preg_match('#(?:^|/)product/([^/]+)#', $path, $matches)) {
            return null;
        }

        $slug = Str::slug(urldecode($matches[1]));
        return $slug !== '' ? $slug : null;
    }

    private function normalizeUrl(string $url): string
    {
        $url = html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return rtrim($url, '/').'/';
    }

    private function isAllowedSourceUrl(string $url): bool
    {
        if (! $this->isHttpUrl($url)) {
            return false;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        return $host === self::SOURCE_HOST || $host === 'b2ujean.com';
    }

    private function isHttpUrl(string $url): bool
    {
        if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https'], true);
    }

    private function cleanText(?string $value): string
    {
        $value = html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

        return trim($value);
    }

    private function nullableText(?string $value): ?string
    {
        $value = $this->cleanText($value);
        return $value !== '' ? $value : null;
    }

    private function progress(string $label, int $current, int $total): void
    {
        if ($total === 0 || $current === $total || $current % 25 === 0) {
            $this->command?->line("B2U: {$label} {$current}/{$total}");
        }
    }
}
