import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, featured, sport } = req.query as { category?: string; featured?: string; sport?: string };
    const conditions = [];
    if (category) conditions.push(eq(productsTable.category, category));
    if (sport) conditions.push(eq(productsTable.sport, sport));
    if (featured === "true") conditions.push(eq(productsTable.featured, true));

    const products = conditions.length
      ? await db.select().from(productsTable).where(and(...conditions))
      : await db.select().from(productsTable);

    res.json(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [product] = await db.insert(productsTable).values(req.body).returning();
    res.status(201).json({
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(productsTable)
      .set(req.body)
      .where(eq(productsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      ...updated,
      price: Number(updated.price),
      originalPrice: updated.originalPrice != null ? Number(updated.originalPrice) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
