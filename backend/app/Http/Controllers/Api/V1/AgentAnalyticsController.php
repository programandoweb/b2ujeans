<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentInteraction;
use App\Models\AgentConversationMessage;
use App\Models\AgentConversationSession;
use App\Models\AgentKnowledgeEntry;
use App\Models\AgentResearchRun;
use App\Models\AgentSetting;
use App\Models\AgentUnansweredQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AgentAnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $since30 = now()->subDays(30);
        $since7 = now()->subDays(6)->startOfDay();

        $hasInteractions = Schema::hasTable('agent_interactions');
        $hasKnowledge = Schema::hasTable('agent_knowledge_entries');
        $hasUnanswered = Schema::hasTable('agent_unanswered_questions');
        $hasSettings = Schema::hasTable('agent_settings');
        $hasResearch = Schema::hasTable('agent_research_runs');

        $interactions30 = $hasInteractions
            ? AgentInteraction::query()->where('created_at', '>=', $since30)->count()
            : 0;
        $knowledgeTotal = $hasKnowledge
            ? AgentKnowledgeEntry::query()->where('status', 'published')->count()
            : 0;
        $unansweredPending = $hasUnanswered
            ? AgentUnansweredQuestion::query()->where('status', 'pending')->count()
            : 0;
        $configuredAgents = $hasSettings
            ? DB::table('agent_settings')->whereNotNull('api_key')->where('api_key', '<>', '')->count()
            : 0;

        $activity = collect(range(0, 6))->map(function (int $offset) use ($since7, $hasInteractions): array {
            $day = $since7->copy()->addDays($offset);

            return [
                'date' => $day->toDateString(),
                'label' => $day->locale('es')->isoFormat('dd D'),
                'interactions' => $hasInteractions
                    ? AgentInteraction::query()->whereDate('created_at', $day->toDateString())->count()
                    : 0,
            ];
        });

        $byAgent = $hasInteractions
            ? AgentInteraction::query()
                ->selectRaw('agent_id, COUNT(*) as total, MAX(created_at) as last_activity')
                ->where('created_at', '>=', $since30)
                ->groupBy('agent_id')
                ->get()
                ->keyBy('agent_id')
            : collect();

        $settings = $hasSettings
            ? DB::table('agent_settings')
                ->select(['agent_id', 'model'])
                ->selectRaw("CASE WHEN api_key IS NOT NULL AND api_key <> '' THEN 1 ELSE 0 END as has_api_key")
                ->get()
                ->keyBy('agent_id')
            : collect();

        $agents = collect(['claudio', 'cristina', 'jorge', 'sofia'])->map(function (string $agent) use ($byAgent, $settings, $hasKnowledge, $hasUnanswered): array {
            $knowledge = $agent === 'claudio' && $hasKnowledge
                ? AgentKnowledgeEntry::query()->where('agent_id', 'claudio')->where('status', 'published')->count()
                : 0;

            $pending = $agent === 'claudio' && $hasUnanswered
                ? AgentUnansweredQuestion::query()->where('agent_id', 'claudio')->where('status', 'pending')->count()
                : 0;

            return [
                'id' => $agent,
                'interactions_30d' => (int) ($byAgent->get($agent)?->total ?? 0),
                'last_activity' => $byAgent->get($agent)?->last_activity,
                'has_api_key' => (bool) ($settings->get($agent)?->has_api_key ?? false),
                'model' => $settings->get($agent)?->model ?? 'gemini-2.5-flash',
                'knowledge_count' => $knowledge,
                'pending_questions' => $pending,
            ];
        });

        $recentQuestions = $hasInteractions
            ? AgentInteraction::query()->latest()->limit(12)->get(['id', 'agent_id', 'question', 'status', 'created_at'])
            : collect();

        $topUnanswered = $hasUnanswered
            ? AgentUnansweredQuestion::query()
                ->where('status', 'pending')
                ->orderByDesc('times_asked')
                ->orderByDesc('last_asked_at')
                ->limit(8)
                ->get(['id', 'agent_id', 'question', 'times_asked', 'last_asked_at'])
            : collect();

        $recentKnowledge = $hasKnowledge
            ? AgentKnowledgeEntry::query()
                ->where('status', 'published')
                ->latest('updated_at')
                ->limit(8)
                ->get(['id', 'agent_id', 'category', 'title', 'confidence', 'source_type', 'updated_at'])
            : collect();

        $research = $hasResearch
            ? AgentResearchRun::query()->latest()->first()
            : null;

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
            'session_id' => ['nullable', 'integer', 'exists:agent_conversation_sessions,id'],
            'question' => ['required', 'string'],
            'answer' => ['nullable', 'string'],
            'status' => ['required', 'string', 'max:50'],
            'duration_ms' => ['nullable', 'integer', 'min:0'],
        ]);

        $agent = strtolower(trim($agent));
        $sessionId = $data['session_id'] ?? null;
        unset($data['session_id']);

        $interaction = DB::transaction(function () use ($data, $agent, $sessionId): AgentInteraction {
            $interaction = AgentInteraction::query()->create([
                ...$data,
                'agent_id' => $agent,
            ]);

            if ($sessionId) {
                $session = AgentConversationSession::query()
                    ->whereKey($sessionId)
                    ->where('agent_id', $agent)
                    ->first();

                if ($session) {
                    if (! empty($data['request_id'])) {
                        AgentConversationMessage::query()->firstOrCreate(
                            [
                                'session_id' => $session->id,
                                'request_id' => $data['request_id'],
                                'role' => 'user',
                            ],
                            ['content' => $data['question']],
                        );
                    }

                    if (filled($data['answer'])) {
                        AgentConversationMessage::query()->firstOrCreate(
                            [
                                'session_id' => $session->id,
                                'request_id' => $data['request_id'] ?? null,
                                'role' => 'assistant',
                            ],
                            ['content' => $data['answer']],
                        );
                    }

                    $session->forceFill(['last_message_at' => now()])->save();
                }
            }

            return $interaction;
        });

        return response()->json(['data' => $interaction], 201);
    }

    private function authorizeInternal(Request $request): void
    {
        $secret = trim((string) config('agents.shared_secret'));
        abort_if($secret === '' || ! hash_equals($secret, (string) $request->header('X-Agent-Shared-Secret', '')), 401, 'No autorizado.');
    }
}
