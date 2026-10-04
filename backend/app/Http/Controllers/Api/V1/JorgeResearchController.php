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

    public function play(): JsonResponse
    {
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
