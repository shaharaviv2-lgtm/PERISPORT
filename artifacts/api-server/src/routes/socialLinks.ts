import { Router } from "express";
import { db } from "@workspace/db";
import { socialLinksTable } from "@workspace/db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const links = await db.select().from(socialLinksTable);
    res.json(links);
  } catch (err) {
    req.log.error({ err }, "Failed to list social links");
    res.status(500).json({ error: "Failed to list social links" });
  }
});

export default router;
