<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\Auth\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_email_receives_generic_response_and_notification(): void
    {
        Notification::fake();
        $user = User::query()->create(['name' => 'Usuario Gaspronal', 'email' => 'usuario@gaspronal.test', 'password' => 'ClaveInicial123!']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJson(['success' => true, 'message' => 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_unknown_email_does_not_reveal_account_existence(): void
    {
        Notification::fake();
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'no-existe@gaspronal.test'])->assertOk()->assertJsonPath('success', true);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'correo-invalido'])->assertUnprocessable();
    }

    public function test_password_reset_endpoint_is_rate_limited(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/v1/auth/forgot-password', ['email' => 'limite@gaspronal.test'])->assertOk();
        }
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'limite@gaspronal.test'])->assertTooManyRequests();
    }

    public function test_valid_token_updates_password_and_cannot_be_reused(): void
    {
        $user = User::query()->create(['name' => 'Usuario Gaspronal', 'email' => 'reset@gaspronal.test', 'password' => 'ClaveInicial123!']);
        $token = Password::broker()->createToken($user);
        $payload = ['email' => $user->email, 'token' => $token, 'password' => 'NuevaClave123!', 'password_confirmation' => 'NuevaClave123!'];

        $this->postJson('/api/v1/auth/reset-password', $payload)->assertOk()->assertJsonPath('success', true);
        $this->assertTrue(Hash::check('NuevaClave123!', $user->fresh()->password));
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable()->assertJsonPath('success', false);
    }

    public function test_invalid_token_is_rejected(): void
    {
        $user = User::query()->create(['name' => 'Usuario Gaspronal', 'email' => 'invalido@gaspronal.test', 'password' => 'ClaveInicial123!']);
        $this->postJson('/api/v1/auth/reset-password', ['email' => $user->email, 'token' => 'token-invalido', 'password' => 'NuevaClave123!', 'password_confirmation' => 'NuevaClave123!'])->assertUnprocessable();
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = User::query()->create(['name' => 'Usuario Gaspronal', 'email' => 'expirado@gaspronal.test', 'password' => 'ClaveInicial123!']);
        $token = Password::broker()->createToken($user);
        Carbon::setTestNow(now()->addMinutes(61));

        try {
            $this->postJson('/api/v1/auth/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'NuevaClave123!', 'password_confirmation' => 'NuevaClave123!'])->assertUnprocessable();
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_password_confirmation_must_match(): void
    {
        $this->postJson('/api/v1/auth/reset-password', ['email' => 'usuario@gaspronal.test', 'token' => 'token', 'password' => 'NuevaClave123!', 'password_confirmation' => 'OtraClave123!'])->assertUnprocessable();
    }

    public function test_password_must_have_at_least_eight_characters(): void
    {
        $this->postJson('/api/v1/auth/reset-password', ['email' => 'usuario@gaspronal.test', 'token' => 'token', 'password' => '1234567', 'password_confirmation' => '1234567'])->assertUnprocessable();
    }
}
