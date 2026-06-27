import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, ordersTable } from "@workspace/db";
import { eq, sql, ne } from "drizzle-orm";

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

    const [{ totalOrders }] = await db
      .select({ totalOrders: sql<number>`count(*)::int` })
      .from(ordersTable);

    const [{ pendingOrders }] = await db
      .select({ pendingOrders: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "pending"));

    const revenueResult = await db
      .select({ totalRevenue: sql<string>`coalesce(sum(total_price::numeric), 0)` })
      .from(ordersTable)
      .where(ne(ordersTable.status, "cancelled"));

    const totalRevenue = Number(revenueResult[0]?.totalRevenue ?? 0);

    res.json({
      totalProducts,
      totalCategories,
      featuredCount,
      brandsCount: 12,
      totalOrders,
      pendingOrders,
      totalRevenue,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get store stats");
    res.status(500).json({ error: "Failed to get store stats" });
  }
});

export default router;
