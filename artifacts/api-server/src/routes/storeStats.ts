import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [{ totalProducts }] = await db
      .select({ totalProducts: sql<number>`count(*)::int` })
      .from(productsTable);

    const [{ totalCategories }] = await db
      .select({ totalCategories: sql<number>`count(*)::int` })
      .from(categoriesTable);

    const [{ featuredCount }] = await db
      .select({ featuredCount: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(eq(productsTable.featured, true));

    res.json({
      totalProducts,
      totalCategories,
      featuredCount,
      brandsCount: 12,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get store stats");
    res.status(500).json({ error: "Failed to get store stats" });
  }
});

export default router;
