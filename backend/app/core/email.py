import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


# ── Helpers ───────────────────────────────────────────────────────────────────

def _send_via_resend(to_email: str, subject: str, html: str, text: str, reply_to: str | None = None) -> bool:
    """Envía email usando la API HTTP de Resend. Devuelve True si tuvo éxito."""
    if not settings.RESEND_API_KEY:
        return False
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        params: resend.Emails.SendParams = {
            "from": f"Dirbook <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html,
            "text": text,
        }
        if reply_to:
            params["reply_to"] = [reply_to]
        resend.Emails.send(params)
        print(f"[DIRBOOK] Email enviado a {to_email} vía Resend")
        return True
    except Exception as exc:
        print(f"[DIRBOOK] Error Resend: {exc}")
        return False


def _send_via_smtp(to_email: str, subject: str, html: str, text: str, reply_to: str | None = None) -> bool:
    """Envía email usando SMTP. Devuelve True si tuvo éxito."""
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return False
    sender_addr = settings.SMTP_USER
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"Dirbook <{sender_addr}>"
    msg["To"]      = to_email
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(sender_addr, to_email, msg.as_string())
        print(f"[DIRBOOK] Email enviado a {to_email} vía SMTP")
        return True
    except Exception as exc:
        print(f"[DIRBOOK] Error SMTP: {exc}")
        return False


def _send(to_email: str, subject: str, html: str, text: str, reply_to: str | None = None) -> None:
    """Intenta Resend primero, luego SMTP, luego imprime en consola."""
    if _send_via_resend(to_email, subject, html, text, reply_to):
        return
    if _send_via_smtp(to_email, subject, html, text, reply_to):
        return
    print(f"\n[DIRBOOK - DEV] Email para {to_email} — {subject}")
    print(f"  {text[:300]}\n")


# ── Emails ────────────────────────────────────────────────────────────────────

def send_reset_email(to_email: str, reset_url: str, user_name: str) -> None:
    year = datetime.datetime.utcnow().year

    html = f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111111;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#facc15;">&#127968; Dirbook</p>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">Conectando tu ciudad</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Hola, {user_name} &#128075;</p>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
              Recibimos una solicitud para restablecer la contrase&ntilde;a de tu cuenta en Dirbook.
              Si no fuiste t&uacute;, puedes ignorar este correo con seguridad.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0 32px;">
                <a href="{reset_url}" style="display:inline-block;background:#facc15;color:#111111;text-decoration:none;font-size:16px;font-weight:800;padding:14px 36px;border-radius:12px;">
                  Restablecer contrase&ntilde;a
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">O copia y pega este enlace:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#2563eb;word-break:break-all;">{reset_url}</p>
            <div style="background:#fef9c3;border-radius:10px;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#92400e;">&#9200; <strong>Este enlace expira en 1 hora.</strong></p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; {year} Dirbook</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

    text = (
        f"Hola {user_name},\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Dirbook.\n\n"
        f"Usa este enlace (válido por 1 hora):\n{reset_url}\n\n"
        "Si no fuiste tú, ignora este mensaje.\n\n— Equipo Dirbook"
    )

    _send(to_email, "Recupera tu contraseña - Dirbook", html, text)


def send_suggestion_email(sender_name: str, sender_email: str, message: str) -> None:
    admin_email = settings.SMTP_USER or settings.SMTP_FROM
    year = datetime.datetime.utcnow().year

    html = f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111111;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#facc15;">&#127968; Dirbook</p>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">Nueva sugerencia recibida</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">De</p>
            <p style="margin:0 0 20px;font-size:16px;font-weight:600;color:#111827;">
              {sender_name} &lt;<a href="mailto:{sender_email}" style="color:#2563eb;">{sender_email}</a>&gt;
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Mensaje</p>
            <div style="background:#f9fafb;border-left:4px solid #facc15;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">{message}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; {year} Dirbook</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>"""

    text = f"Sugerencia de {sender_name} <{sender_email}>:\n\n{message}"

    _send(admin_email, f"Nueva sugerencia de {sender_name} — Dirbook", html, text, reply_to=sender_email)
