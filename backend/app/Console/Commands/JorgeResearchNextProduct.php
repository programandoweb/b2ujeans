<?php

namespace App\Console\Commands;

use App\Models\AgentResearchRun;
use App\Models\CatalogItem;
use App\Services\JorgeProductResearchService;
use Illuminate\Console\Command;
use Throwable;

class JorgeResearchNextProduct extends Command
{
    protected $signature = 'agent:jorge:research-next';
    protected $description = 'Procesa el siguiente producto pendiente del investigador Jorge.';

    public function handle(JorgeProductResearchService $service): int
    {
        $run = AgentResearchRun::query()->where('agent_id', 'jorge')->first();

        if (! $run || $run->status !== 'running') {
            return self::SUCCESS;
        }

        $item = CatalogItem::query()
            ->where('type', 'product')
            ->whereIn('legacy_research_status', ['pending', 'failed'])
            ->orderByRaw("CASE WHEN legacy_research_status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->first();

        if (! $item) {
            $run->update([
                'status' => 'completed',
                'current_catalog_item_id' => null,
                'finished_at' => now(),
                'last_heartbeat_at' => now(),
                'processed_items' => CatalogItem::query()->where('type', 'product')->count(),
                'successful_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'completed')->count(),
                'failed_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'failed')->count(),
            ]);

            return self::SUCCESS;
        }

        $run->update([
            'current_catalog_item_id' => $item->id,
            'last_heartbeat_at' => now(),
        ]);

        $item->update([
            'legacy_research_status' => 'processing',
            'legacy_research_error' => null,
        ]);

        try {
            $service->research($item);
            $this->info("Producto {$item->id} investigado correctamente.");
        } catch (Throwable $exception) {
            report($exception);
            $item->update([
                'legacy_research_status' => 'failed',
                'legacy_research_error' => mb_substr($exception->getMessage(), 0, 5000),
                'legacy_researched_at' => now(),
            ]);
            $run->update(['last_error' => mb_substr($exception->getMessage(), 0, 5000)]);
            $this->error("Producto {$item->id}: {$exception->getMessage()}");
        }

        $run->update([
            'current_catalog_item_id' => null,
            'last_heartbeat_at' => now(),
            'processed_items' => CatalogItem::query()->where('type', 'product')->whereIn('legacy_research_status', ['completed', 'failed'])->count(),
            'successful_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'completed')->count(),
            'failed_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'failed')->count(),
        ]);

        return self::SUCCESS;
    }
}
