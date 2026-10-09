<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\CommercialLead;
use App\Models\CommercialQuote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PublicCartCheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:190'],
            'email' => ['required', 'email', 'max:190'],
            'whatsapp' => ['required', 'string', 'min:7', 'max:40'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1500'],
            'items' => ['required', 'array', 'min:1', 'max:40'],
            'items.*.id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'between:1,99'],
        ]);

        $result = DB::transaction(function () use ($data): array {
            $ids = array_column($data['items'], 'id');
            $products = CatalogItem::query()
                ->whereIn('id', $ids)
                ->where('type', 'product')
                ->where('status', 'published')
                ->whereNotNull('published_at')
                ->get()
                ->keyBy('id');

            if ($products->count() !== count($ids)) {
                throw ValidationException::withMessages(['items' => 'Uno o más productos ya no están disponibles. Actualiza el carrito.']);
            }

            $currencies = $products->pluck('price_currency')->filter()->unique()->values();
            if ($currencies->count() > 1) {
                throw ValidationException::withMessages(['items' => 'No se pueden combinar productos con monedas diferentes.']);
            }

            $currency = (string) ($currencies->first() ?: 'COP');
            $lead = CommercialLead::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'whatsapp' => $data['whatsapp'],
                'source' => 'web_cart',
                'status' => 'new',
                'notes' => "Entrega: {$data['address']}, {$data['city']}".(empty($data['notes']) ? '' : "\nObservaciones: {$data['notes']}"),
            ]);

            $missingPrices = false;
            $total = 0;
            $lines = [];
            foreach ($data['items'] as $line) {
                $product = $products->get($line['id']);
                $missingPrices = $missingPrices || $product->commercial_price === null;
                $price = (float) ($product->commercial_price ?? 0);
                $lineTotal = round($price * $line['quantity'], 2);
                $total += $lineTotal;
                $lines[] = [
                    'catalog_item_id' => $product->id,
                    'description' => $product->name.($product->reference ? " (Ref. {$product->reference})" : ''),
                    'quantity' => $line['quantity'],
                    'unit_price' => $price,
                    'line_total' => $lineTotal,
                ];
            }

            $quote = CommercialQuote::create([
                'lead_id' => $lead->id,
                'number' => 'B2U-'.strtoupper(Str::random(8)),
                'status' => 'pending_approval',
                'currency' => $currency,
                'subtotal' => $total,
                'total' => $total,
                'notes' => "Pedido desde carrito web.\nDirección: {$data['address']}\nCiudad: {$data['city']}\n".($data['notes'] ?? '').($missingPrices ? "\nHay artículos sin precio: confirmar antes de cobrar." : "\nTotal sin envío: pendiente de confirmación."),
                'created_by_agent' => 'web_cart',
            ]);
            $quote->items()->createMany($lines);

            return ['id' => $quote->id, 'number' => $quote->number, 'status' => 'pending_approval', 'needs_price_confirmation' => $missingPrices];
        });

        return response()->json([
            'data' => $result,
            'message' => 'Solicitud recibida. Nuestro equipo confirmará los detalles y la disponibilidad antes del pago.',
        ], 201);
    }
}
