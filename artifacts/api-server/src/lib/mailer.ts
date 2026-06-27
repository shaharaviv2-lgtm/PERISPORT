import { Resend } from "resend";
import { logger } from "./logger.js";

const ADMIN_EMAIL = "shaharaviv2@gmail.com";

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  items: string;
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
}

function buildEmailHtml(order: OrderEmailData): string {
  let parsedItems: Array<{ name: string; size?: string; quantity: number; price: number }> = [];
  try {
    parsedItems = JSON.parse(order.items);
  } catch {
    parsedItems = [];
  }

  const itemsRows = parsedItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;">${item.name}${item.size ? ` — ${item.size}` : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;text-align:left;">₪${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

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
      <tr>
        <td style="padding:12px;color:#888;width:40%;border-bottom:1px solid #2a2a2a;">שם לקוח</td>
        <td style="padding:12px;font-weight:bold;border-bottom:1px solid #2a2a2a;">${order.customerName}</td>
      </tr>
      <tr>
        <td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">טלפון</td>
        <td style="padding:12px;font-weight:bold;border-bottom:1px solid #2a2a2a;">${order.customerPhone}</td>
      </tr>
      <tr>
        <td style="padding:12px;color:#888;border-bottom:1px solid #2a2a2a;">תאריך</td>
        <td style="padding:12px;border-bottom:1px solid #2a2a2a;">${new Date(order.createdAt).toLocaleString("he-IL")}</td>
      </tr>
      ${order.notes ? `<tr><td style="padding:12px;color:#888;">הערות</td><td style="padding:12px;">${order.notes}</td></tr>` : ""}
    </table>

    <h3 style="margin-bottom:12px;color:#ffffff;">פריטים שהוזמנו</h3>
    <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2a2a2a;margin-bottom:24px;">
      <thead>
        <tr style="background:#1e1e1e;">
          <th style="padding:10px 12px;text-align:right;color:#888;font-weight:normal;">מוצר</th>
          <th style="padding:10px 12px;color:#888;font-weight:normal;">כמות</th>
          <th style="padding:10px 12px;text-align:left;color:#888;font-weight:normal;">מחיר</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div style="background:#99ff00;padding:16px;text-align:center;">
      <span style="font-size:22px;font-weight:900;color:#0a0a0a;">סה"כ לתשלום: ₪${order.totalPrice.toFixed(2)}</span>
    </div>

    <p style="margin-top:24px;font-size:12px;color:#555;text-align:center;">הזמנה זו התקבלה מחנות PERI Sport</p>
  </div>
</body>
</html>`;
}

export async function sendOrderEmail(order: OrderEmailData): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not set — skipping order notification email");
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "PERI Sport <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `🛒 הזמנה חדשה #${order.orderId} — ${order.customerName}`,
      html: buildEmailHtml(order),
    });
    if (error) {
      logger.error({ error, orderId: order.orderId }, "Resend rejected the email");
    } else {
      logger.info({ orderId: order.orderId, emailId: data?.id }, "Order notification email sent");
    }
  } catch (err) {
    logger.error({ err, orderId: order.orderId }, "Failed to send order notification email");
  }
}
