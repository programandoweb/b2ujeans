<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bienvenido a GaspronalApp</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f9;color:#17212b;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7f9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe5ea;border-radius:18px;overflow:hidden;">
<tr><td style="padding:28px 30px 18px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td>
<div style="font-size:18px;font-weight:800;letter-spacing:.08em;color:#025C99;">GASPRONALAPP</div>
<div style="margin-top:4px;font-size:12px;color:#6b7280;">Tu espacio de trabajo en Gaspronal</div>
</td>
<td align="right"><span style="display:inline-block;padding:7px 10px;border:1px solid #d8e4ec;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.12em;color:#025C99;">INVITACIÓN</span></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 30px;">
@if($imageUrl)
<img src="{{ $imageUrl }}" width="580" alt="Bienvenido a GaspronalApp" style="display:block;width:100%;max-width:580px;height:auto;border:0;border-radius:14px;background:#eef3f6;">
@else
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#025C99;border-radius:14px;"><tr><td style="padding:34px 28px;color:#ffffff;">
<div style="font-size:11px;font-weight:700;letter-spacing:.18em;color:#d9edf9;">BIENVENIDO</div>
<div style="margin-top:10px;font-size:26px;line-height:1.25;font-weight:800;">Tu acceso a GaspronalApp está listo</div>
<div style="margin-top:10px;font-size:14px;line-height:1.6;color:#e5f2fa;">Define tu contraseña y comienza a utilizar las herramientas que tienes asignadas.</div>
</td></tr></table>
@endif
</td></tr>

<tr><td style="padding:30px;">
<h1 style="margin:0;font-size:28px;line-height:1.2;letter-spacing:-.02em;color:#17212b;">¡Bienvenido a GaspronalApp!</h1>
<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">Hola {{ $user->name }},</p>
<p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">Tu cuenta ha sido creada para que puedas ingresar a GaspronalApp. Para completar la activación, define una contraseña personal y segura usando el siguiente botón.</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;"><tr><td bgcolor="#025C99" style="border-radius:12px;">
<a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Crear mi contraseña</a>
</td></tr></table>

<p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">Por seguridad, este enlace estará disponible durante {{ $expiresInMinutes }} minutos. Si expira, puedes solicitar un nuevo enlace desde la opción de recuperación de contraseña.</p>

<div style="margin-top:22px;padding:16px 18px;border-left:4px solid #EC7025;background:#fff8f3;border-radius:10px;">
<p style="margin:0;font-size:13px;line-height:1.7;color:#5f4a3e;"><strong style="color:#EC7025;">Importante:</strong> Gaspronal nunca te solicitará que envíes tu contraseña por correo, chat o WhatsApp.</p>
</div>

<div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
<p style="margin:6px 0 0;word-break:break-all;font-size:12px;line-height:1.6;color:#4b5563;">{{ $resetUrl }}</p>
</div>
</td></tr>

<tr><td style="padding:18px 30px 28px;background:#fafafa;border-top:1px solid #eeeeee;">
<p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">Este correo fue enviado porque un administrador de GaspronalApp habilitó tu acceso a la plataforma.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
