<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentResearchRun;
use App\Models\CatalogItem;
use Illuminate\Http\JsonResponse;

class JorgeResearchController extends Controller
{
    public function show(): JsonResponse
    {
        $run = AgentResearchRun::query()->firstOrCreate(
            ['agent_id' => 'jorge'],
            ['status' => 'idle', 'total_items' => CatalogItem::query()->where('type', 'product')->count()]
        );

        $run->refresh();
        $run->load('currentItem:id,name,reference,legacy_research_status');

        return response()->json([
            'data' => [
                'run' => $run,
                'pending_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'pending')->count(),
                'completed_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'completed')->count(),
            ],
        ]);
    }

    public function history(): JsonResponse
    {
        $items = CatalogItem::query()
            ->where('type', 'product')
            ->whereIn('legacy_research_status', ['processing', 'completed', 'failed'])
            ->orderByRaw("CASE legacy_research_status WHEN 'processing' THEN 0 ELSE 1 END")
            ->orderByDesc('legacy_researched_at')
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get([
                'id',
                'name',
                'reference',
                'legacy_source_url',
                'legacy_research_status',
                'legacy_research_error',
                'legacy_researched_at',
                'gallery',
                'updated_at',
            ])
            ->map(function (CatalogItem $item): array {
                $gallery = is_array($item->gallery) ? $item->gallery : [];

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'reference' => $item->reference,
                    'status' => $item->legacy_research_status,
                    'error' => $item->legacy_research_error,
                    'researched_at' => optional($item->legacy_researched_at)->toIso8601String(),
                    'updated_at' => optional($item->updated_at)->toIso8601String(),
                    'source_url' => $item->legacy_source_url,
                    'gallery_count' => count($gallery),
                    'image' => $gallery[0] ?? null,
                ];
            })
            ->values();

        return response()->json(['data' => $items]);
    }

    public function play(): JsonResponse
    {
        CatalogItem::query()
            ->where('type', 'product')
            ->where('legacy_research_status', 'processing')
            ->update(['legacy_research_status' => 'pending']);

        $run = AgentResearchRun::query()->firstOrCreate(['agent_id' => 'jorge']);

        $run->update([
            'status' => 'running',
            'total_items' => CatalogItem::query()->where('type', 'product')->count(),
            'processed_items' => CatalogItem::query()->where('type', 'product')->whereIn('legacy_research_status', ['completed', 'failed'])->count(),
            'successful_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'completed')->count(),
            'failed_items' => CatalogItem::query()->where('type', 'product')->where('legacy_research_status', 'failed')->count(),
            'started_at' => $run->started_at ?? now(),
            'finished_at' => null,
            'last_error' => null,
        ]);

        return $this->show();
    }

    public function pause(): JsonResponse
    {
        AgentResearchRun::query()->updateOrCreate(
            ['agent_id' => 'jorge'],
            ['status' => 'paused', 'last_heartbeat_at' => now()]
        );

        return $this->show();
    }

    public function stop(): JsonResponse
    {
        AgentResearchRun::query()->updateOrCreate(
            ['agent_id' => 'jorge'],
            [
                'status' => 'stopped',
                'current_catalog_item_id' => null,
                'finished_at' => now(),
                'last_heartbeat_at' => now(),
            ]
        );

        return $this->show();
    }
}
