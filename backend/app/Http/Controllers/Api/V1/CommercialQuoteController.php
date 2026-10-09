<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CommercialQuote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommercialQuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            CommercialQuote::query()
                ->with(['lead:id,name,email,whatsapp,status', 'items'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->latest()
                ->paginate(min(max($request->integer('per_page', 25), 1), 100))
        );
    }

    public function show(CommercialQuote $commercialQuote): JsonResponse
    {
        return response()->json(['data' => $commercialQuote->load(['lead', 'items'])]);
    }

    public function update(Request $request, CommercialQuote $commercialQuote): JsonResponse
    {
        abort_unless($commercialQuote->status === 'pending_approval', 422, 'Solamente las propuestas pendientes se pueden editar.');

        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($commercialQuote, $data): void {
            $items = $commercialQuote->items()->get()->keyBy('id');
            $total = 0.0;

            foreach ($data['items'] as $line) {
                $item = $items->get((int) $line['id']);
                abort_unless($item, 422, 'La línea de propuesta no pertenece a esta cotización.');

                $quantity = (float) $line['quantity'];
                $unitPrice = (float) $line['unit_price'];
                $lineTotal = round($quantity * $unitPrice, 2);
                $total += $lineTotal;

                $item->update([
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);
            }

            $commercialQuote->update([
                'notes' => $data['notes'] ?? null,
                'subtotal' => $total,
                'total' => $total,
                'status' => 'pending_approval',
            ]);
        });

        return $this->show($commercialQuote->fresh());
    }

    public function changeStatus(Request $request, CommercialQuote $commercialQuote): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:processing,shipped,completed,cancelled'],
        ]);

        $allowed = [
            'pending_approval' => ['cancelled'],
            'approved' => ['processing', 'cancelled'],
            'processing' => ['shipped', 'cancelled'],
            'shipped' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        abort_unless(
            in_array($data['status'], $allowed[$commercialQuote->status] ?? [], true),
            422,
            'La transición de estado no está permitida.'
        );

        DB::transaction(function () use ($commercialQuote, $data): void {
            $commercialQuote->update(['status' => $data['status']]);
            if ($data['status'] === 'cancelled') {
                $commercialQuote->lead()->update(['status' => 'closed']);
            }
        });

        return $this->show($commercialQuote->fresh());
    }

    public function approve(CommercialQuote $commercialQuote): JsonResponse
    {
        abort_unless($commercialQuote->status === 'pending_approval', 422, 'La propuesta no está pendiente de aprobación.');
        if ($commercialQuote->created_by_agent === 'web_cart') {
            abort_if(
                $commercialQuote->items()->where('unit_price', '<=', 0)->exists(),
                422,
                'Confirma y guarda los precios de todos los artículos antes de aprobar el pedido.'
            );
        }

        DB::transaction(function () use ($commercialQuote): void {
            $commercialQuote->update([
                'status' => 'approved',
                'approved_by' => auth('api')->id(),
                'approved_at' => now(),
            ]);
            $commercialQuote->lead()->update([
                'status' => 'awaiting_human',
                'human_followup_at' => now(),
            ]);
        });

        return $this->show($commercialQuote->fresh());
    }
}
