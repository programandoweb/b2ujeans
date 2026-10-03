<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;color:#171717;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
<tr><td style="padding:28px 30px 18px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td><div style="font-size:17px;font-weight:800;letter-spacing:.12em;">{{ strtoupper($applicationName) }}</div><div style="margin-top:4px;font-size:12px;color:#6b7280;">Acceso seguro a tu cuenta</div></td>
<td align="right"><span style="display:inline-block;padding:7px 10px;border:1px solid #d1d5db;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.12em;color:#4b5563;">RECUPERAR CONTRASEÑA</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 30px;">
@if($imageUrl)
<img src="{{ $imageUrl }}" width="580" alt="Recuperación segura de acceso" style="display:block;width:100%;max-width:580px;height:auto;border:0;border-radius:14px;background:#eeeeee;">
@else
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#171717;border-radius:14px;"><tr><td style="padding:34px 28px;color:#ffffff;">
<div style="font-size:11px;font-weight:700;letter-spacing:.18em;color:#d1d5db;">SEGURIDAD</div>
<div style="margin-top:10px;font-size:24px;line-height:1.25;font-weight:800;">Recupera el acceso de forma segura</div>
<div style="margin-top:10px;font-size:14px;line-height:1.6;color:#d1d5db;">El enlace de recuperación es temporal y solo debe ser utilizado por ti.</div>
</td></tr></table>
@endif
</td></tr>
<tr><td style="padding:30px;">
<h1 style="margin:0;font-size:28px;line-height:1.2;letter-spacing:-.02em;">Recupera el acceso a tu cuenta</h1>
<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">Hola {{ $user->name }},</p>
<p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva contraseña.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;"><tr><td bgcolor="#171717" style="border-radius:12px;">
<a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Restablecer contraseña</a>
</td></tr></table>
<p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">Este enlace tiene una vigencia de {{ $expiresInMinutes }} minutos por motivos de seguridad.</p>
<p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual continuará funcionando.</p>
<div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
<p style="margin:6px 0 0;word-break:break-all;font-size:12px;line-height:1.6;color:#4b5563;">{{ $resetUrl }}</p>
</div>
</td></tr>
<tr><td style="padding:18px 30px 28px;background:#fafafa;border-top:1px solid #eeeeee;">
<p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
