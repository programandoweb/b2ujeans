<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\Auth\UserInvitationNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Throwable;

class PasswordResetService
{
    public function sendResetLink(string $email): void
    {
        try {
            Password::broker()->sendResetLink(['email' => $email]);
        } catch (Throwable $exception) {
            Log::warning('Password reset notification could not be dispatched.', [
                'exception' => $exception::class,
            ]);
        }
    }

    public function sendInvitation(User $user): void
    {
        $token = Password::broker()->createToken($user);
        $user->notify(new UserInvitationNotification($token));
    }

    public function reset(string $email, string $token, string $password): bool
    {
        $status = Password::broker()->reset(
            [
                'email' => $email,
                'token' => $token,
                'password' => $password,
                'password_confirmation' => $password,
            ],
            function (User $user, string $newPassword): void {
                $user->forceFill(['password' => $newPassword]);
                $user->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET;
    }
}
