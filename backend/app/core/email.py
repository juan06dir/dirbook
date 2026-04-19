import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_reset_email(to_email: str, reset_url: str, user_name: str) -> None:
    """Envía el correo de recuperación de contraseña.
    Si SMTP no está configurado, imprime el enlace en consola (modo desarrollo).
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n[DIRBOOK - DEV] Enlace de recuperación para {to_email}:")
        print(f"  {reset_url}\n")
        return

    year = datetime.datetime.utcnow().year

    msg = MIMEMultipart("alternative")
    sender_addr = settings.SMTP_USER or settings.SMTP_FROM
    msg["Subject"] = "Recupera tu contraseña - Dirbook"
    msg["From"]    = f"Dirbook <{sender_addr}>"
    msg["To"]      = to_email

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#facc15;letter-spacing:-0.5px;">
                &#127968; Dirbook
              </p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">
                Conectando tu ciudad
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                Hola, {user_name} &#128075;
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Recibimos una solicitud para restablecer la contrase&ntilde;a de tu cuenta en Dirbook.
                Si no fuiste t&uacute;, puedes ignorar este correo con seguridad.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{reset_url}"
                       style="display:inline-block;background:#facc15;
                              color:#111111;text-decoration:none;font-size:16px;font-weight:800;
                              padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                      Restablecer contrase&ntilde;a
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#2563eb;word-break:break-all;">
                {reset_url}
              </p>

              <div style="background:#fef9c3;border-radius:10px;padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  &#9200; <strong>Este enlace expira en 1 hora.</strong>
                  Si ya expir&oacute;, solicita uno nuevo en la p&aacute;gina de inicio de sesi&oacute;n.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; {year} Dirbook &middot; Si no solicitaste este cambio, ignora este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text = (
        f"Hola {user_name},\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Dirbook.\n\n"
        f"Usa este enlace para hacerlo (válido por 1 hora):\n{reset_url}\n\n"
        "Si no fuiste tú, ignora este mensaje.\n\n"
        "— Equipo Dirbook"
    )

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    # Gmail obliga a que el remitente del sobre (envelope) coincida con la cuenta autenticada
    envelope_from = settings.SMTP_USER or settings.SMTP_FROM

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(envelope_from, to_email, msg.as_string())
        print(f"[DIRBOOK] Email enviado a {to_email}")
    except Exception as exc:
        print(f"[DIRBOOK] Error al enviar email a {to_email}: {exc}")
        print(f"[DIRBOOK - FALLBACK] Enlace de recuperación: {reset_url}")
