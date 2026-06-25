---
name: Admin mutation routes — no auth/validation
description: Sports-store product POST/PUT/DELETE routes are unauthenticated and pass raw req.body to Drizzle.
---

# Admin product mutation routes: no auth, no input validation

The sports-store product mutation endpoints (`POST/PUT/DELETE /api/products[/:id]`)
have **no server-side authentication/authorization** and pass `req.body` straight
into Drizzle (`db.insert(...).values(req.body)`, `db.update(...).set(req.body)`)
with no Zod parsing. "Admin mode" is a **client-side toggle only** — the API does
not enforce it.

**Why:** This is the established convention across all mutation handlers, not an
oversight of one feature. The PUT (edit) handler was intentionally written to match
the pre-existing POST handler for consistency.

**How to apply:** If you add a new product mutation route, follow the same pattern
unless the user explicitly asks to add auth/validation. If hardening is requested,
fix POST/PUT/DELETE together (admin-only middleware + Zod parse of body + explicit
field whitelist + validate `id` is a positive int) so the routes stay consistent —
do not validate one endpoint in isolation.
