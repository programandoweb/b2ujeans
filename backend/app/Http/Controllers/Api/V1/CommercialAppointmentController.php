<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CommercialAppointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommercialAppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            CommercialAppointment::query()
                ->with('lead:id,name,email,whatsapp,status')
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->orderBy('scheduled_at')
                ->paginate(min(max($request->integer('per_page', 50), 1), 100))
        );
    }
}
