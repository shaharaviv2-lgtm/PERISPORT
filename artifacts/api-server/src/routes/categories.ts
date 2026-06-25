import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);
    const counts = await db
      .select({ category: productsTable.category, count: sql<number>`count(*)::int` })
      .from(productsTable)
      .groupBy(productsTable.category);

    const countMap = Object.fromEntries(counts.map((c) => [c.category, c.count]));

    res.json(
      cats.map((c) => ({
        ...c,
        productCount: countMap[c.slug] ?? 0,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

export default router;
