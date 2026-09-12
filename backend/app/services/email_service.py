import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_password_reset_otp(recipient_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit verification code to recipient_email using Resend API.
    If RESEND_API_KEY is not configured, logs the code for local/staging testing.
    """
    if not settings.resend_api_key:
        logger.warning(
            f"[TESTING/NO RESEND KEY] Password reset code for {recipient_email}: {otp_code}"
        )
        print(f"\n==========================================")
        print(f"🔑 [SIKAMITRA OTP] Code for {recipient_email}: {otp_code}")
        print(f"==========================================\n")
        return True

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px; }}
        .card {{ max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
        .logo {{ display: inline-block; width: 42px; height: 42px; line-height: 42px; text-align: center; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; font-weight: bold; font-size: 20px; margin-bottom: 20px; }}
        h1 {{ font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; }}
        p {{ color: #475569; font-size: 15px; line-height: 1.6; margin: 8px 0; }}
        .otp-box {{ margin: 28px 0; padding: 18px; background: #f1f5f9; border-radius: 12px; text-align: center; border: 1px dashed #cbd5e1; }}
        .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace; }}
        .notice {{ font-size: 13px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">S</div>
        <h1>Password Reset Verification</h1>
        <p>You requested to reset your password for your <strong>Sikamitra</strong> account.</p>
        <p>Enter the 6-digit verification code below on the password reset page:</p>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <div class="notice">
          Sikamitra — AI Study Companion
        </div>
      </div>
    </body>
    </html>
    """

    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.resend_from_email,
                "to": [recipient_email],
                "subject": f"{otp_code} is your Sikamitra verification code",
                "html": html_content,
            },
            timeout=10.0,
        )
        if response.status_code in (200, 201):
            logger.info(f"Password reset email sent successfully to {recipient_email}")
            return True
        else:
            logger.error(f"Resend error ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send email via Resend: {e}")
        return False
