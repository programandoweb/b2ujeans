<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\CommercialAppointment;
use App\Models\CommercialLead;
use App\Models\CommercialQuote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InternalAgentCommercialController extends Controller
{
    public function execute(Request $request, string $agent): JsonResponse
    {
        $this->authorizeAgent($request);
        abort_unless(strtolower($agent) === 'claudio', 404, 'Herramientas comerciales no disponibles para este agente.');

        $payload = $request->validate([
            'tool' => ['required', 'string'],
            'arguments' => ['nullable', 'array'],
        ]);

        $arguments = $payload['arguments'] ?? [];

        return match ($payload['tool']) {
            'catalog_search' => $this->catalogSearch($arguments),
            'create_quote' => $this->createQuote($arguments),
            'create_appointment' => $this->createAppointment($arguments),
            'handoff_to_human' => $this->handoff($arguments),
            default => abort(422, 'Herramienta comercial no reconocida.'),
        };
    }

    private function catalogSearch(array $arguments): JsonResponse
    {
        $query = trim((string) ($arguments['query'] ?? ''));

        $items = CatalogItem::query()
            ->where('status', 'published')
            ->whereNotNull('commercial_price')
            ->when($query !== '', fn ($q) => $q->where(fn ($inner) => $inner
                ->where('name', 'like', "%{$query}%")
                ->orWhere('reference', 'like', "%{$query}%")
                ->orWhere('short_description', 'like', "%{$query}%")))
            ->limit(20)
            ->get(['id', 'name', 'reference', 'short_description', 'commercial_price', 'price_currency', 'price_unit']);

        return response()->json(['data' => $items]);
    }

    private function createQuote(array $arguments): JsonResponse
    {
        validator($arguments, [
            'name' => ['required', 'string', 'max:190'],
            'email' => ['required', 'email', 'max:190'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.catalog_item_id' => ['required', 'integer', 'exists:catalog_items,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ])->validate();

        $quote = DB::transaction(function () use ($arguments): CommercialQuote {
            $lead = CommercialLead::query()->firstOrCreate(
                ['email' => strtolower(trim($arguments['email'])), 'whatsapp' => trim($arguments['whatsapp'])],
                ['name' => trim($arguments['name']), 'source' => 'claudio', 'status' => 'quote_created']
            );
            $lead->update(['name' => trim($arguments['name']), 'status' => 'quote_created']);

            $quote = CommercialQuote::create([
                'lead_id' => $lead->id,
                'number' => 'GAS-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
                'status' => 'awaiting_human',
                'currency' => 'COP',
                'notes' => $arguments['notes'] ?? null,
                'created_by_agent' => 'claudio',
            ]);

            $total = 0.0;
            foreach ($arguments['items'] as $line) {
                $item = CatalogItem::query()->whereKey($line['catalog_item_id'])->where('status', 'published')->firstOrFail();
                abort_if($item->commercial_price === null, 422, "El producto {$item->name} no tiene precio comercial configurado.");

                $quantity = (float) $line['quantity'];
                $unitPrice = (float) $item->commercial_price;
                $lineTotal = round($quantity * $unitPrice, 2);
                $total += $lineTotal;

                $quote->items()->create([
                    'catalog_item_id' => $item->id,
                    'description' => $item->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);
            }

            $quote->update(['subtotal' => $total, 'total' => $total]);
            return $quote->fresh(['lead', 'items']);
        });

        return response()->json(['data' => $quote], 201);
    }

    private function createAppointment(array $arguments): JsonResponse
    {
        validator($arguments, [
            'name' => ['required', 'string', 'max:190'],
            'email' => ['required', 'email', 'max:190'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'channel' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ])->validate();

        $lead = CommercialLead::query()->firstOrCreate(
            ['email' => strtolower(trim($arguments['email'])), 'whatsapp' => trim($arguments['whatsapp'])],
            ['name' => trim($arguments['name']), 'source' => 'claudio']
        );
        $lead->update(['name' => trim($arguments['name']), 'status' => 'appointment_scheduled']);

        $appointment = CommercialAppointment::create([
            'lead_id' => $lead->id,
            'scheduled_at' => $arguments['scheduled_at'],
            'status' => 'scheduled',
            'channel' => $arguments['channel'] ?? 'commercial_call',
            'notes' => $arguments['notes'] ?? null,
            'created_by_agent' => 'claudio',
        ]);

        return response()->json(['data' => $appointment->load('lead')], 201);
    }

    private function handoff(array $arguments): JsonResponse
    {
        validator($arguments, [
            'name' => ['required', 'string', 'max:190'],
            'email' => ['required', 'email', 'max:190'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ])->validate();

        $lead = CommercialLead::query()->firstOrCreate(
            ['email' => strtolower(trim($arguments['email'])), 'whatsapp' => trim($arguments['whatsapp'])],
            ['name' => trim($arguments['name']), 'source' => 'claudio']
        );
        $lead->update([
            'name' => trim($arguments['name']),
            'status' => 'awaiting_human',
            'notes' => $arguments['notes'] ?? $lead->notes,
            'human_followup_at' => now(),
        ]);

        return response()->json(['data' => $lead]);
    }

    private function authorizeAgent(Request $request): void
    {
        $secret = trim((string) config('agents.shared_secret'));
        abort_if($secret === '' || ! hash_equals($secret, (string) $request->header('X-Agent-Shared-Secret', '')), 401, 'No autorizado.');
    }
}
