<?php

namespace App\Services;

use App\Models\CommunicationProvider;
use App\Models\User;
use App\Models\WhatsAppLoginCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class WhatsAppOtpService
{
    public function isAvailable(): bool
    {
        if (! CommunicationProvider::query()->where('channel', 'whatsapp')->where('enabled', true)->exists()) {
            return false;
        }

        try {
            $response = $this->http()->timeout(3)->get($this->realtimeUrl('/api/channels'));

            if (! $response->successful()) {
                return false;
            }

            return collect($response->json('data', []))->contains(
                fn (array $provider): bool =>
                    ($provider['channel'] ?? null) === 'whatsapp'
                    && ($provider['enabled'] ?? false) === true
                    && ($provider['runtime_status'] ?? null) === 'connected'
            );
        } catch (Throwable) {
            return false;
        }
    }

    public function requestPin(string $rawPhone): void
    {
        $phone = $this->normalizePhone($rawPhone);
        if (! $phone || ! $this->isAvailable()) {
            return;
        }

        $user = User::query()->where('whatsapp', $phone)->first();
        if (! $user) {
            return;
        }

        WhatsAppLoginCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $pin = (string) random_int(1000, 9999);
        $code = WhatsAppLoginCode::query()->create([
            'user_id' => $user->id,
            'phone' => $phone,
            'code_hash' => Hash::make($pin),
            'expires_at' => now()->addMinutes((int) config('whatsapp_auth.ttl_minutes', 5)),
            'attempts' => 0,
        ]);

        try {
            $response = $this->http()
                ->timeout(8)
                ->post($this->realtimeUrl('/api/channels/send/whatsapp'), [
                    'recipient' => $phone,
                    'text' => $this->message($user, $pin),
                ]);

            if (! $response->successful()) {
                $code->delete();
                Log::warning('WhatsApp OTP delivery failed.', [
                    'user_id' => $user->id,
                    'status' => $response->status(),
                ]);
            }
        } catch (Throwable $exception) {
            $code->delete();
            Log::warning('WhatsApp OTP delivery failed.', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function verifyPin(string $rawPhone, string $pin): ?User
    {
        $phone = $this->normalizePhone($rawPhone);
        if (! $phone || ! preg_match('/^\d{4}$/', $pin)) {
            return null;
        }

        $user = User::query()->where('whatsapp', $phone)->first();
        if (! $user) {
            return null;
        }

        $code = WhatsAppLoginCode::query()
            ->where('user_id', $user->id)
            ->where('phone', $phone)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        if (! $code) {
            return null;
        }

        $maxAttempts = (int) config('whatsapp_auth.max_attempts', 5);
        if ($code->attempts >= $maxAttempts) {
            $code->update(['used_at' => now()]);
            return null;
        }

        $code->increment('attempts');
        $code->refresh();

        if (! Hash::check($pin, $code->code_hash)) {
            if ($code->attempts >= $maxAttempts) {
                $code->update(['used_at' => now()]);
            }
            return null;
        }

        $code->update(['used_at' => now()]);

        return $user;
    }

    public function normalizePhone(string $phone): ?string
    {
        $phone = trim($phone);
        $phone = preg_replace('/[\s\-().]/', '', $phone) ?? '';

        if (preg_match('/^3\d{9}$/', $phone)) {
            $phone = '+57'.$phone;
        } elseif (preg_match('/^57\d{10}$/', $phone)) {
            $phone = '+'.$phone;
        }

        return preg_match('/^\+[1-9]\d{7,14}$/', $phone) ? $phone : null;
    }

    private function message(User $user, string $pin): string
    {
        $minutes = (int) config('whatsapp_auth.ttl_minutes', 5);

        return "*Gaspronal | Acceso seguro*\n\n"
            ."Hola, {$user->name}.\n\n"
            ."Tu código de acceso es:\n\n"
            ."*{$pin}*\n\n"
            ."Este código vence en {$minutes} minutos y solo puede utilizarse una vez.\n"
            ."Si no solicitaste este acceso, ignora este mensaje.";
    }

    private function http()
    {
        $secret = (string) config('whatsapp_auth.shared_secret', '');

        return Http::acceptJson()->when(
            $secret !== '',
            fn ($request) => $request->withToken($secret)
        );
    }

    private function realtimeUrl(string $path): string
    {
        return rtrim((string) config('whatsapp_auth.realtime_url'), '/').$path;
    }
}
