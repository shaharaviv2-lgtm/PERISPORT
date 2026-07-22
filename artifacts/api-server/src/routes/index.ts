import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import socialLinksRouter from "./socialLinks";
import storeStatsRouter from "./storeStats";
import uploadRouter from "./upload";
import ordersRouter from "./orders";
import storageRouter from "./storage";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/social-links", socialLinksRouter);
router.use("/store-stats", storeStatsRouter);
router.use("/upload", uploadRouter);
router.use("/orders", ordersRouter);
router.use("/storage", storageRouter);

router.get("/featured", async (req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.featured, true));
    res.json(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to get featured products" });
  }
});

export default router;
