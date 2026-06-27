import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { sendOrderEmail } from "../lib/mailer.js";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(s: unknown): s is OrderStatus {
  return typeof s === "string" && (VALID_STATUSES as readonly string[]).includes(s);
}

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));
    res.json(
      orders.map((o) => ({
        ...o,
        totalPrice: Number(o.totalPrice),
        createdAt: o.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.post("/", async (req, res) => {
  const { customerName, customerPhone, items, totalPrice, notes } = req.body as Record<string, unknown>;
  if (
    typeof customerName !== "string" || !customerName.trim() ||
    typeof customerPhone !== "string" || !customerPhone.trim() ||
    typeof items !== "string" || !items.trim() ||
    typeof totalPrice !== "number" || totalPrice <= 0
  ) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }
  try {
    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items,
        totalPrice: String(totalPrice),
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
        status: "pending",
      })
      .returning();

    const response = {
      ...order,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt.toISOString(),
    };

    res.status(201).json(response);

    sendOrderEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      totalPrice: Number(order.totalPrice),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
    }).catch(() => {});

  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { status } = req.body as { status: unknown };
  if (!isValidStatus(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  try {
    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
      ...updated,
      totalPrice: Number(updated.totalPrice),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
