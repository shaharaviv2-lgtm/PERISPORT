import { logger } from "./logger.js";

const ADMIN_EMAIL = "Talparienta@gmail.com";

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  items: string;
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
}

type ParsedItem = { name: string; size?: string; quantity: number; price: number };

function parseItems(raw: string): ParsedItem[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function itemsTable(parsedItems: ParsedItem[]): string {
  const rows = parsedItems.map((item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;">${item.name}${item.size ? ` — ${item.size}` : ""}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:left;">₪${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");

  return `
    <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2a2a2a;margin-bottom:24px;">
      <thead>
        <tr style="background:#1e1e1e;">
          <th style="padding:10px 12px;text-align:right;color:#888;font-weight:normal;">מוצר</th>
          <th style="padding:10px 12px;color:#888;font-weight:normal;">כמות</th>
          <th style="padding:10px 12px;text-align:left;color:#888;font-weight:normal;">מחיר</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildAdminHtml(order: OrderEmailData): string {
  const parsedItems = parseItems(order.items);
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#99ff00;padding:4px 16px;margin-bottom:24px;">
      <h1 style="font-size:28px;font-weight:900;color:#0a0a0a;margin:0;letter-spacing:2px;">PERI SPORT</h1>
    </div>
    <h2 style="font-size:20px;margin-bottom:24px;color:#ffffff;">🛒 הזמנה חדשה #${order.orderId}</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#141414;border:1px solid #2a2a2a;">
      <tr><td style="padding:12px;color:#888;width:40%;border-bottom:1px solid #2a2a2a;">שם לקוח</td><td style="padding:12px;font-weight:bold;border-bottom:1px solid #2a2a2a;">${order.customerName}</td></tr>
      <tr><td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">טלפון</td><td style="padding:12px;font-weight:bold;border-bottom:1px solid #2a2a2a;">${order.customerPhone}</td></tr>
      ${order.customerEmail ? `<tr><td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">אימייל</td><td style="padding:12px;border-bottom:1px solid #2a2a2a;">${order.customerEmail}</td></tr>` : ""}
      ${order.customerAddress ? `<tr><td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">כתובת למשלוח</td><td style="padding:12px;font-weight:bold;border-bottom:1px solid #2a2a2a;">${order.customerAddress}</td></tr>` : ""}
      <tr><td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">תאריך</td><td style="padding:12px;border-bottom:1px solid #2a2a2a;">${new Date(order.createdAt).toLocaleString("he-IL")}</td></tr>
      ${order.notes ? `<tr><td style="padding:12px;color:#888;">הערות</td><td style="padding:12px;">${order.notes}</td></tr>` : ""}
    </table>
    <h3 style="margin-bottom:12px;color:#ffffff;">פריטים שהוזמנו</h3>
    ${itemsTable(parsedItems)}
    <div style="background:#99ff00;padding:16px;text-align:center;">
      <span style="font-size:22px;font-weight:900;color:#0a0a0a;">סה"כ לתשלום: ₪${order.totalPrice.toFixed(2)}</span>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#555;text-align:center;">הזמנה זו התקבלה מחנות PERI Sport</p>
  </div>
</body>
</html>`;
}

function buildCustomerHtml(order: OrderEmailData): string {
  const parsedItems = parseItems(order.items);
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#99ff00;padding:4px 16px;margin-bottom:24px;">
      <h1 style="font-size:28px;font-weight:900;color:#0a0a0a;margin:0;letter-spacing:2px;">PERI SPORT</h1>
    </div>
    <h2 style="font-size:20px;margin-bottom:8px;color:#ffffff;">תודה על הזמנתך, ${order.customerName}! 🎉</h2>
    <p style="color:#aaa;margin-bottom:24px;">ההזמנה שלך התקבלה בהצלחה. להלן פרטי הקבלה:</p>
    <div style="background:#141414;border:1px solid #2a2a2a;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px 0;color:#888;font-size:12px;">מספר הזמנה</p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#99ff00;">#${order.orderId}</p>
    </div>
    <h3 style="margin-bottom:12px;color:#ffffff;">פרטי ההזמנה</h3>
    ${itemsTable(parsedItems)}
    <div style="background:#99ff00;padding:16px;text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:900;color:#0a0a0a;">סה"כ לתשלום: ₪${order.totalPrice.toFixed(2)}</span>
    </div>
    <div style="background:#141414;border:1px solid #2a2a2a;padding:16px;border-right:4px solid #99ff00;">
      <p style="margin:0 0 8px 0;color:#fff;font-weight:bold;">מה הלאה?</p>
      <p style="margin:0;color:#aaa;font-size:14px;line-height:1.6;">לאחר אישור התשלום נחזור אליך בהקדם. לכל שאלה ניתן לפנות אלינו בוואטסאפ.</p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#555;text-align:center;">PERI Sport — תודה שקנית אצלנו!</p>
  </div>
</body>
</html>`;
}

async function sendViaBrevo(to: string, subject: string, html: string, apiKey: string, senderEmail: string): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "PERI Sport", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo error ${res.status}: ${text}`);
  }
}

export async function sendOrderEmail(order: OrderEmailData): Promise<void> {
  const apiKey = process.env["BREVO_API_KEY"];
  const senderEmail = process.env["BREVO_SENDER_EMAIL"] ?? ADMIN_EMAIL;

  if (!apiKey) {
    logger.warn("BREVO_API_KEY not set — skipping order emails");
    return;
  }

  const tasks: Promise<void>[] = [];

  // Email to admin
  tasks.push(
    sendViaBrevo(ADMIN_EMAIL, `🛒 הזמנה חדשה #${order.orderId} — ${order.customerName}`, buildAdminHtml(order), apiKey, senderEmail)
      .then(() => logger.info({ orderId: order.orderId }, "Admin order email sent"))
      .catch((err: unknown) => logger.error({ err, orderId: order.orderId }, "Failed to send admin email"))
  );

  // Email to customer
  if (order.customerEmail) {
    tasks.push(
      sendViaBrevo(order.customerEmail, `אישור הזמנה #${order.orderId} — PERI Sport`, buildCustomerHtml(order), apiKey, senderEmail)
        .then(() => logger.info({ orderId: order.orderId }, "Customer confirmation email sent"))
        .catch((err: unknown) => logger.error({ err, orderId: order.orderId }, "Failed to send customer email"))
    );
  }

  await Promise.all(tasks);
}
