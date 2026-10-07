<?php

namespace App\Services;

use App\Models\CatalogItem;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class JorgeProductResearchService
{
    private const BASE = 'https://www.b2ujean.com';

    public function research(CatalogItem $item): array
    {
        $sourceUrl = $this->findSourceUrl($item);
        $response = $this->getPage($sourceUrl);
        $html = $response->body();
        $xpath = new DOMXPath($this->document($html));

        $title = $this->firstText($xpath, '//h1') ?: $item->name;
        $description = $this->extractDescription($xpath) ?: $item->description;
        $meta = $this->extractMeta($xpath, $sourceUrl);
        $sourceImages = $this->extractImages($xpath, $sourceUrl);
        $gallery = $this->downloadImages($sourceImages, $item->id);

        if ($gallery === []) {
            throw new RuntimeException('No se encontró ninguna imagen oficial válida para copiar localmente.');
        }

        $legacyMeta = is_array($item->legacy_meta) ? $item->legacy_meta : [];
        $legacyMeta['source_url'] = $sourceUrl;
        $legacyMeta['source_images'] = $sourceImages;
        $legacyMeta['local_gallery'] = $gallery;
        $legacyMeta['image_researched_at'] = now()->toIso8601String();

        $item->update([
            'description' => $description,
            'short_description' => ($meta['description'] ?? null) ?: $item->short_description,
            'seo_title' => ($meta['title'] ?? null) ?: $title ?: $item->seo_title,
            'seo_description' => ($meta['description'] ?? null) ?: $item->seo_description,
            'og_image' => $gallery[0],
            'gallery' => $gallery,
            'legacy_source_url' => $sourceUrl,
            'legacy_meta' => $legacyMeta,
            'legacy_raw_html' => $html,
            'legacy_research_status' => 'completed',
            'legacy_research_error' => null,
            'legacy_researched_at' => now(),
        ]);

        return ['source_url' => $sourceUrl, 'title' => $title, 'images' => $gallery, 'meta' => $legacyMeta];
    }

    public function findSourceUrl(CatalogItem $item): string
    {
        $stored = trim((string) $item->legacy_source_url);
        $candidates = array_values(array_unique(array_filter([
            $stored,
            self::BASE.'/product/'.trim($item->slug, '/').'/',
        ])));

        foreach ($candidates as $candidate) {
            if (! $this->isOfficialHost($candidate)) continue;
            $response = Http::timeout(20)->retry(2, 500)->withHeaders($this->headers())->get($candidate);
            if ($response->successful()) return $candidate;
        }

        throw new RuntimeException('No fue posible abrir la ficha oficial B2U del producto.');
    }

    private function getPage(string $url): Response
    {
        if (! $this->isOfficialHost($url)) throw new RuntimeException('La URL fuente no pertenece a B2U Jeans.');
        $response = Http::timeout(30)->retry(2, 500)->withHeaders($this->headers())->get($url);
        if (! $response->successful()) throw new RuntimeException("La ficha oficial respondió HTTP {$response->status()}.");
        return $response;
    }

    private function headers(): array
    {
        return [
            'User-Agent' => 'Mozilla/5.0 B2UImageResearch/1.0',
            'Accept' => 'text/html,application/xhtml+xml,image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        ];
    }

    private function extractImages(DOMXPath $xpath, string $sourceUrl): array
    {
        $images = [];

        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-gallery ")]//img') ?: [] as $node) {
            if (! $node instanceof DOMElement) continue;

            foreach (['data-large_image', 'data-src', 'data-lazy-src', 'src'] as $attribute) {
                $value = trim((string) $node->getAttribute($attribute));
                if ($value !== '') $this->addImageCandidate($images, $this->absoluteUrl($value, $sourceUrl));
            }

            foreach (['srcset', 'data-srcset'] as $attribute) {
                foreach ($this->srcsetUrls((string) $node->getAttribute($attribute)) as $value) {
                    $this->addImageCandidate($images, $this->absoluteUrl($value, $sourceUrl));
                }
            }
        }

        foreach ($xpath->query('//meta[@property="og:image" or @property="og:image:secure_url"]') ?: [] as $node) {
            if ($node instanceof DOMElement) {
                $this->addImageCandidate($images, $this->absoluteUrl((string) $node->getAttribute('content'), $sourceUrl));
            }
        }

        return array_keys($images);
    }

    private function addImageCandidate(array &$images, string $url): void
    {
        $url = $this->cleanImageUrl($url);
        if ($url === '' || ! $this->isOfficialHost($url)) return;

        // Primero el original de WordPress; después la variante encontrada como fallback.
        foreach ($this->imageCandidates($url) as $candidate) $images[$candidate] = true;
    }

    private function imageCandidates(string $url): array
    {
        $url = $this->cleanImageUrl($url);
        $parts = parse_url($url);
        if (! is_array($parts) || empty($parts['path'])) return [$url];

        $path = (string) $parts['path'];
        $originalPath = preg_replace('/-scaled(?=\.[a-z0-9]+$)/i', '', $path) ?? $path;
        $originalPath = preg_replace('/-\d+x\d+(?=\.[a-z0-9]+$)/i', '', $originalPath) ?? $originalPath;

        $base = ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? 'www.b2ujean.com');
        $original = $base.$originalPath;
        if (! empty($parts['query'])) $original .= '?'.$parts['query'];

        return array_values(array_unique([$original, $url]));
    }

    private function downloadImages(array $urls, int $productId): array
    {
        $directory = public_path("images/uploads/agente/{$productId}");
        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new RuntimeException("No fue posible crear {$directory}.");
        }

        $saved = [];
        $seenBodies = [];
        foreach ($urls as $url) {
            if (count($saved) >= 20) break;

            $response = Http::timeout(30)->retry(2, 500)->withHeaders($this->headers())->get($url);
            if (! $response->successful()) continue;

            $contentType = strtolower((string) $response->header('Content-Type'));
            if (! str_starts_with($contentType, 'image/')) continue;

            $body = $response->body();
            $hash = sha1($body);
            if (isset($seenBodies[$hash])) continue;

            $image = @imagecreatefromstring($body);
            if ($image === false) continue;

            $number = count($saved);
            $filename = $number === 0 ? 'image.jpg' : 'image-'.($number + 1).'.jpg';
            $target = $directory.'/'.$filename;
            imageinterlace($image, true);
            imagejpeg($image, $target, 88);
            imagedestroy($image);

            $seenBodies[$hash] = true;
            $saved[] = "/images/uploads/agente/{$productId}/{$filename}";
        }

        return $saved;
    }

    private function cleanImageUrl(string $url): string
    {
        $url = html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        // Una imagen nunca se normaliza como página: elimina slash después de la extensión.
        return preg_replace('#(\.(?:jpe?g|png|webp|gif|avif))/+(?=\?|$)#i', '$1', $url) ?? $url;
    }

    private function srcsetUrls(string $srcset): array
    {
        $result = [];
        foreach (explode(',', $srcset) as $candidate) {
            $url = trim((string) preg_split('/\s+/', trim($candidate))[0]);
            if ($url !== '') $result[] = $url;
        }
        return $result;
    }

    private function extractMeta(DOMXPath $xpath, string $sourceUrl): array
    {
        $meta = ['source_url' => $sourceUrl];
        $title = $xpath->query('//title')?->item(0);
        if ($title) $meta['title'] = trim($title->textContent);
        foreach ($xpath->query('//meta[@content]') ?: [] as $node) {
            if (! $node instanceof DOMElement) continue;
            $key = strtolower(trim((string) ($node->getAttribute('name') ?: $node->getAttribute('property'))));
            $value = trim((string) $node->getAttribute('content'));
            if ($key !== '' && $value !== '') $meta[$key] = $value;
        }
        return $meta;
    }

    private function extractDescription(DOMXPath $xpath): ?string
    {
        foreach ([
            '//*[@id="tab-description"]',
            '//*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-details__short-description ")]',
        ] as $query) {
            $node = $xpath->query($query)?->item(0);
            if ($node) {
                $text = trim(preg_replace('/\s+/u', ' ', $node->textContent) ?? '');
                if ($text !== '') return $text;
            }
        }
        return null;
    }

    private function document(string $html): DOMDocument
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_clear_errors();
        return $document;
    }

    private function firstText(DOMXPath $xpath, string $query): ?string
    {
        $node = $xpath->query($query)?->item(0);
        return $node ? trim(preg_replace('/\s+/u', ' ', $node->textContent) ?? '') : null;
    }

    private function absoluteUrl(string $url, string $base): string
    {
        $url = trim($url);
        if (preg_match('#^https?://#i', $url)) return $url;
        if (str_starts_with($url, '//')) return 'https:'.$url;
        if (str_starts_with($url, '/')) return self::BASE.$url;

        $parts = parse_url($base);
        $path = isset($parts['path']) ? rtrim(dirname((string) $parts['path']), '/') : '';
        return ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? 'www.b2ujean.com').$path.'/'.$url;
    }

    private function isOfficialHost(string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        return in_array($host, ['b2ujean.com', 'www.b2ujean.com'], true);
    }
}
