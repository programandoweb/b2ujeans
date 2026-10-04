<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentKnowledgeEntry;
use App\Models\AgentUnansweredQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentKnowledgeController extends Controller
{
    public function knowledge(Request $request, string $agent): JsonResponse
    {
        $agent = $this->agent($agent);

        return response()->json(
            AgentKnowledgeEntry::query()
                ->where('agent_id', $agent)
                ->when($request->filled('search'), function ($query) use ($request): void {
                    $search = '%'.trim((string) $request->string('search')).'%';
                    $query->where(fn ($q) => $q
                        ->where('title', 'like', $search)
                        ->orWhere('question', 'like', $search)
                        ->orWhere('answer', 'like', $search)
                        ->orWhere('category', 'like', $search));
                })
                ->latest('updated_at')
                ->paginate(min(max($request->integer('per_page', 20), 1), 100))
        );
    }

    public function unanswered(Request $request, string $agent): JsonResponse
    {
        $agent = $this->agent($agent);

        return response()->json(
            AgentUnansweredQuestion::query()
                ->where('agent_id', $agent)
                ->where('status', $request->string('status', 'pending'))
                ->orderByDesc('times_asked')
                ->orderByDesc('last_asked_at')
                ->paginate(min(max($request->integer('per_page', 20), 1), 100))
        );
    }

    public function answer(Request $request, string $agent, AgentUnansweredQuestion $question): JsonResponse
    {
        $agent = $this->agent($agent);
        abort_unless($question->agent_id === $agent, 404);

        $data = $request->validate([
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'source_url' => ['nullable', 'url', 'max:1000'],
            'keywords' => ['nullable', 'string'],
        ]);

        $entry = AgentKnowledgeEntry::query()->create([
            'agent_id' => $agent,
            'category' => $data['category'] ?? 'preguntas frecuentes',
            'title' => mb_substr($question->question, 0, 220),
            'question' => $question->question,
            'answer' => trim($data['answer']),
            'keywords' => $data['keywords'] ?? null,
            'source_url' => $data['source_url'] ?? null,
            'source_type' => 'curated',
            'confidence' => 100,
            'status' => 'published',
            'created_by' => $request->user()?->id,
        ]);

        $question->update([
            'status' => 'answered',
            'resolution' => $entry->answer,
            'knowledge_entry_id' => $entry->id,
            'resolved_by' => $request->user()?->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['data' => $question->fresh('knowledgeEntry')]);
    }

    public function discard(Request $request, string $agent, AgentUnansweredQuestion $question): JsonResponse
    {
        $agent = $this->agent($agent);
        abort_unless($question->agent_id === $agent, 404);

        $question->update([
            'status' => 'discarded',
            'resolution' => $request->input('reason'),
            'resolved_by' => $request->user()?->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['data' => $question->fresh()]);
    }

    private function agent(string $agent): string
    {
        $agent = strtolower(trim($agent));
        abort_unless($agent === 'claudio', 404, 'Base de conocimiento no disponible para este agente.');

        return $agent;
    }
}
