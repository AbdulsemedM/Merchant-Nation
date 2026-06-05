type WhatsAppPayload = {
  phone: string;
  title: string;
  message: string;
};

function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendWhatsAppNotification(
  payload: WhatsAppPayload,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, error: "Missing WhatsApp API config" };
  }

  const to = normalizeWhatsAppPhone(payload.phone);
  if (!to) return { ok: false, error: "Missing WhatsApp phone number" };

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: `${payload.title}\n${payload.message}`,
        },
      }),
    },
  );
  if (!res.ok) return { ok: false, error: `WhatsApp API ${res.status}` };
  return { ok: true };
}

