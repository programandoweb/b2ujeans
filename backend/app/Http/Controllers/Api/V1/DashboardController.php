<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\CommercialAppointment;
use App\Models\CommercialLead;
use App\Models\CommercialQuote;
use App\Models\CommunicationOutboundMessage;
use App\Models\CommunicationProvider;
use App\Models\Post;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $weekStart = $now->copy()->subDays(6)->startOfDay();

        $catalogTotal = CatalogItem::query()->count();
        $catalogPublished = CatalogItem::query()->where('status', 'published')->count();
        $products = CatalogItem::query()->where('type', 'product')->count();
        $services = CatalogItem::query()->where('type', 'service')->count();

        $postsTotal = Post::query()->count();
        $postsPublished = Post::query()->where('status', 'published')->count();

        $leadsTotal = CommercialLead::query()->count();
        $leadsThisMonth = CommercialLead::query()->where('created_at', '>=', $monthStart)->count();

        $quotesTotal = CommercialQuote::query()->count();
        $quotesPending = CommercialQuote::query()->where('status', 'pending_approval')->count();
        $quotesApproved = CommercialQuote::query()->where('status', 'approved')->count();
        $approvedValue = (float) CommercialQuote::query()->where('status', 'approved')->sum('total');

        $upcomingAppointments = CommercialAppointment::query()
            ->where('scheduled_at', '>=', $now)
            ->count();

        $providersTotal = CommunicationProvider::query()->count();
        $providersEnabled = CommunicationProvider::query()->where('enabled', true)->count();

        $messages30d = CommunicationOutboundMessage::query()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->count();
        $messagesSent30d = CommunicationOutboundMessage::query()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->where('status', 'sent')
            ->count();
        $messagesFailed30d = CommunicationOutboundMessage::query()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->where('status', 'failed')
            ->count();

        $deliveryRate = $messages30d > 0
            ? round(($messagesSent30d / $messages30d) * 100, 1)
            : 0.0;

        $leadTrend = CommercialLead::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', $weekStart)
            ->groupBy('day')
            ->pluck('total', 'day');

        $quoteTrend = CommercialQuote::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', $weekStart)
            ->groupBy('day')
            ->pluck('total', 'day');

        $activity = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $leadTrend, $quoteTrend): array {
            $day = $weekStart->copy()->addDays($offset);

            return [
                'date' => $day->toDateString(),
                'label' => $day->locale('es')->isoFormat('dd D'),
                'leads' => (int) ($leadTrend[$day->toDateString()] ?? 0),
                'quotes' => (int) ($quoteTrend[$day->toDateString()] ?? 0),
            ];
        });

        $recentQuotes = CommercialQuote::query()
            ->with('lead:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'lead_id', 'number', 'status', 'currency', 'total', 'created_at'])
            ->map(fn (CommercialQuote $quote) => [
                'id' => $quote->id,
                'number' => $quote->number,
                'status' => $quote->status,
                'currency' => $quote->currency,
                'total' => (float) $quote->total,
                'lead_name' => $quote->lead?->name,
                'created_at' => $quote->created_at,
            ]);

        $nextAppointments = CommercialAppointment::query()
            ->with('lead:id,name')
            ->where('scheduled_at', '>=', $now)
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get(['id', 'lead_id', 'scheduled_at', 'status', 'channel'])
            ->map(fn (CommercialAppointment $appointment) => [
                'id' => $appointment->id,
                'scheduled_at' => $appointment->scheduled_at,
                'status' => $appointment->status,
                'channel' => $appointment->channel,
                'lead_name' => $appointment->lead?->name,
            ]);

        return response()->json([
            'data' => [
                'catalog' => [
                    'total' => $catalogTotal,
                    'published' => $catalogPublished,
                    'products' => $products,
                    'services' => $services,
                    'publication_rate' => $catalogTotal > 0 ? round(($catalogPublished / $catalogTotal) * 100, 1) : 0.0,
                ],
                'content' => [
                    'posts_total' => $postsTotal,
                    'posts_published' => $postsPublished,
                ],
                'commercial' => [
                    'leads_total' => $leadsTotal,
                    'leads_this_month' => $leadsThisMonth,
                    'quotes_total' => $quotesTotal,
                    'quotes_pending' => $quotesPending,
                    'quotes_approved' => $quotesApproved,
                    'approved_value' => $approvedValue,
                    'upcoming_appointments' => $upcomingAppointments,
                ],
                'communications' => [
                    'providers_total' => $providersTotal,
                    'providers_enabled' => $providersEnabled,
                    'messages_30d' => $messages30d,
                    'sent_30d' => $messagesSent30d,
                    'failed_30d' => $messagesFailed30d,
                    'delivery_rate' => $deliveryRate,
                ],
                'activity_7d' => $activity,
                'recent_quotes' => $recentQuotes,
                'next_appointments' => $nextAppointments,
                'generated_at' => $now,
            ],
        ]);
    }
}
