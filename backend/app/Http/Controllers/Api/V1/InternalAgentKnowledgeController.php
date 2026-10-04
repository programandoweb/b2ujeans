<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AgentKnowledgeEntry;
use App\Models\AgentUnansweredQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InternalAgentKnowledgeController extends Controller
{
    public function execute(Request $request, string $agent): JsonResponse
    {
        $this->authorizeAgent($request);

        $agent = strtolower(trim($agent));
        abort_unless(in_array($agent, ['claudio', 'sofia'], true), 404, 'Herramientas de conocimiento no disponibles para este agente.');

        $payload = $request->validate([
            'tool' => ['required', 'string'],
            'arguments' => ['nullable', 'array'],
        ]);

        $arguments = $payload['arguments'] ?? [];

        return match ($payload['tool']) {
            'knowledge_search' => $this->search($arguments),
            'register_unanswered_question' => $this->registerUnanswered($arguments),
            'knowledge_upsert' => $this->upsertKnowledge($agent, $arguments),
            'unresolved_questions' => $this->unresolvedQuestions($agent),
            default => abort(422, 'Herramienta de conocimiento no reconocida.'),
        };
    }

    private function search(array $arguments): JsonResponse
    {
        $query = trim((string) ($arguments['query'] ?? ''));
        abort_if($query === '', 422, 'La consulta es obligatoria.');

        $stopWords = ['donde', 'cuando', 'como', 'cual', 'cuales', 'para', 'desde', 'hasta', 'sobre', 'esta', 'este', 'estos', 'estas', 'tiene', 'tienen', 'gaspronal'];
        $terms = collect(preg_split('/\\s+/', Str::lower(Str::ascii($query))) ?: [])
            ->map(fn ($term) => trim($term, " .,;:¿?¡!()[]{}\"'"))
            ->filter(fn ($term) => mb_strlen($term) >= 3 && ! in_array($term, $stopWords, true))
            ->unique()
            ->take(8)
            ->values();

        if ($terms->isEmpty()) {
            $terms = collect([$query]);
        }

        $entries = AgentKnowledgeEntry::query()
            ->where('agent_id', 'claudio')
            ->where('status', 'published')
            ->where(function ($q) use ($terms): void {
                foreach ($terms as $term) {
                    $like = '%'.$term.'%';
                    $q->orWhere('title', 'like', $like)
                        ->orWhere('question', 'like', $like)
                        ->orWhere('answer', 'like', $like)
                        ->orWhere('keywords', 'like', $like)
                        ->orWhere('category', 'like', $like);
                }
            })
            ->orderByDesc('confidence')
            ->latest('updated_at')
            ->limit(8)
            ->get(['id', 'category', 'title', 'question', 'answer', 'source_url', 'source_type', 'confidence']);

        return response()->json(['data' => $entries]);
    }

    private function registerUnanswered(array $arguments): JsonResponse
    {
        $question = trim((string) ($arguments['question'] ?? ''));
        abort_if($question === '', 422, 'La pregunta es obligatoria.');

        $normalized = Str::lower(Str::ascii(preg_replace('/\s+/', ' ', $question) ?? $question));
        $hash = hash('sha256', $normalized);

        $item = AgentUnansweredQuestion::query()
            ->firstOrNew(['agent_id' => 'claudio', 'normalized_hash' => $hash]);

        if (! $item->exists) {
            $item->question = $question;
            $item->times_asked = 1;
            $item->status = 'pending';
        } else {
            $item->times_asked = max(1, $item->times_asked + 1);
            if ($item->status === 'pending') {
                $item->question = $question;
            }
        }

        $item->last_asked_at = now();
        $item->save();

        return response()->json([
            'data' => [
                'id' => $item->id,
                'status' => $item->status,
                'times_asked' => $item->times_asked,
            ],
        ]);
    }

    private function upsertKnowledge(string $agent, array $arguments): JsonResponse
    {
        abort_unless($agent === 'sofia', 403, 'Sólo Sofía puede publicar conocimiento mediante esta herramienta.');

        validator($arguments, [
            'title' => ['required', 'string', 'max:220'],
            'question' => ['nullable', 'string'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'keywords' => ['nullable', 'string'],
            'source_url' => ['nullable', 'url', 'max:1000'],
            'confidence' => ['nullable', 'integer', 'min:1', 'max:100'],
            'question_id' => ['nullable', 'integer', 'exists:agent_unanswered_questions,id'],
        ])->validate();

        $entry = AgentKnowledgeEntry::query()->create([
            'agent_id' => 'claudio',
            'title' => trim((string) $arguments['title']),
            'question' => isset($arguments['question']) ? trim((string) $arguments['question']) : null,
            'answer' => trim((string) $arguments['answer']),
            'category' => isset($arguments['category']) ? trim((string) $arguments['category']) : null,
            'keywords' => isset($arguments['keywords']) ? trim((string) $arguments['keywords']) : null,
            'source_url' => $arguments['source_url'] ?? null,
            'source_type' => 'research',
            'confidence' => (int) ($arguments['confidence'] ?? 90),
            'status' => 'published',
            'created_by_agent' => 'sofia',
        ]);

        if (! empty($arguments['question_id'])) {
            $question = AgentUnansweredQuestion::query()
                ->where('agent_id', 'claudio')
                ->find($arguments['question_id']);

            if ($question) {
                $question->update([
                    'status' => 'answered',
                    'resolution' => $entry->answer,
                    'knowledge_entry_id' => $entry->id,
                    'resolved_at' => now(),
                ]);
            }
        }

        return response()->json(['data' => $entry], 201);
    }

    private function unresolvedQuestions(string $agent): JsonResponse
    {
        abort_unless($agent === 'sofia', 403, 'Sólo Sofía puede consultar esta cola mediante la herramienta.');

        $items = AgentUnansweredQuestion::query()
            ->where('agent_id', 'claudio')
            ->where('status', 'pending')
            ->orderByDesc('times_asked')
            ->orderByDesc('last_asked_at')
            ->limit(30)
            ->get(['id', 'question', 'times_asked', 'last_asked_at', 'created_at']);

        return response()->json(['data' => $items]);
    }

    private function authorizeAgent(Request $request): void
    {
        $secret = trim((string) config('agents.shared_secret'));
        abort_if($secret === '' || ! hash_equals($secret, (string) $request->header('X-Agent-Shared-Secret', '')), 401, 'No autorizado.');
    }
}
