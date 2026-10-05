<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $query = http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], '', '&', PHP_QUERY_RFC3986);

        $imagePath = 'programandoweb/default/recover.jpg';
        $publicBackendUrl = rtrim((string) config('app.public_backend_url'), '/');
        $imageUrl = file_exists(public_path($imagePath))
            ? $publicBackendUrl.'/'.$imagePath
            : null;

        return (new MailMessage())
            ->subject('Recuperación de contraseña')
            ->view('emails.auth.reset-password', [
                'user' => $notifiable,
                'resetUrl' => $frontendUrl.'/reset-password?'.$query,
                'imageUrl' => $imageUrl,
                'expiresInMinutes' => (int) config('auth.passwords.users.expire', 60),
                'applicationName' => (string) config('app.name'),
            ]);
    }
}
