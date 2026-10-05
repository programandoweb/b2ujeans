<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentInteraction;
use App\Models\AgentKnowledgeEntry;
use App\Models\AgentResearchRun;
use App\Models\AgentSetting;
use App\Models\AgentUnansweredQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentAnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $since30 = now()->subDays(30);
        $since7 = now()->subDays(6)->startOfDay();

        $interactions30 = AgentInteraction::query()->where('created_at', '>=', $since30)->count();
        $knowledgeTotal = AgentKnowledgeEntry::query()->where('status', 'published')->count();
        $unansweredPending = AgentUnansweredQuestion::query()->where('status', 'pending')->count();
        $configuredAgents = AgentSetting::query()->whereNotNull('api_key')->count();

        $activity = collect(range(0, 6))->map(function (int $offset) use ($since7): array {
            $day = $since7->copy()->addDays($offset);

            return [
                'date' => $day->toDateString(),
                'label' => $day->locale('es')->isoFormat('dd D'),
                'interactions' => AgentInteraction::query()
                    ->whereDate('created_at', $day->toDateString())
                    ->count(),
            ];
        });

        $byAgent = AgentInteraction::query()
            ->selectRaw('agent_id, COUNT(*) as total, MAX(created_at) as last_activity')
            ->where('created_at', '>=', $since30)
            ->groupBy('agent_id')
            ->get()
            ->keyBy('agent_id');

        $settings = AgentSetting::query()
            ->get(['agent_id', 'model', 'api_key'])
            ->keyBy('agent_id');

        $agents = collect(['claudio', 'cristina', 'jorge', 'sofia'])->map(function (string $agent) use ($byAgent, $settings): array {
            $knowledge = $agent === 'claudio'
                ? AgentKnowledgeEntry::query()->where('agent_id', 'claudio')->where('status', 'published')->count()
                : 0;

            $pending = $agent === 'claudio'
                ? AgentUnansweredQuestion::query()->where('agent_id', 'claudio')->where('status', 'pending')->count()
                : 0;

            return [
                'id' => $agent,
                'interactions_30d' => (int) ($byAgent[$agent]?->total ?? 0),
                'last_activity' => $byAgent[$agent]?->last_activity,
                'has_api_key' => filled($settings[$agent]?->api_key),
                'model' => $settings[$agent]?->model ?? 'gemini-2.5-flash',
                'knowledge_count' => $knowledge,
                'pending_questions' => $pending,
            ];
        });

        $recentQuestions = AgentInteraction::query()
            ->latest()
            ->limit(12)
            ->get(['id', 'agent_id', 'question', 'status', 'created_at']);

        $topUnanswered = AgentUnansweredQuestion::query()
            ->where('status', 'pending')
            ->orderByDesc('times_asked')
            ->orderByDesc('last_asked_at')
            ->limit(8)
            ->get(['id', 'agent_id', 'question', 'times_asked', 'last_asked_at']);

        $recentKnowledge = AgentKnowledgeEntry::query()
            ->where('status', 'published')
            ->latest('updated_at')
            ->limit(8)
            ->get(['id', 'agent_id', 'category', 'title', 'confidence', 'source_type', 'updated_at']);

        $research = AgentResearchRun::query()->latest()->first();

        return response()->json(['data' => [
            'kpis' => [
                'interactions_30d' => $interactions30,
                'knowledge_total' => $knowledgeTotal,
                'unanswered_pending' => $unansweredPending,
                'configured_agents' => $configuredAgents,
            ],
            'agents' => $agents,
            'activity_7d' => $activity,
            'recent_questions' => $recentQuestions,
            'top_unanswered' => $topUnanswered,
            'recent_knowledge' => $recentKnowledge,
            'research' => $research ? [
                'status' => $research->status,
                'processed_items' => $research->processed_items,
                'total_items' => $research->total_items,
                'successful_items' => $research->successful_items,
                'failed_items' => $research->failed_items,
                'last_heartbeat_at' => $research->last_heartbeat_at,
            ] : null,
            'generated_at' => now(),
        ]]);
    }

    public function internalLog(Request $request, string $agent): JsonResponse
    {
        $this->authorizeInternal($request);

        $data = $request->validate([
            'request_id' => ['nullable', 'uuid'],
            'question' => ['required', 'string'],
            'answer' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:50'],
            'duration_ms' => ['nullable', 'integer', 'min:0'],
        ]);

        $interaction = AgentInteraction::query()->create([
            ...$data,
            'agent_id' => strtolower(trim($agent)),
        ]);

        return response()->json(['data' => $interaction], 201);
    }

    private function authorizeInternal(Request $request): void
    {
        $secret = trim((string) config('agents.shared_secret'));
        abort_if($secret === '' || ! hash_equals($secret, (string) $request->header('X-Agent-Shared-Secret', '')), 401, 'No autorizado.');
    }
}
