---
name: Radix Select empty-string value crash
description: Radix UI Select.Item throws at runtime when value="" — use a sentinel
---

`@radix-ui/react-select` (v2.x) throws "A <Select.Item /> must have a value prop that is not an empty string" the moment a `SelectItem` with `value=""` mounts (i.e. when the dropdown opens). This is a hard crash that takes down the whole page/form.

**Why:** Radix reserves the empty string internally to represent "no selection" / clearing the value, so it cannot be a real item value.

**How to apply:** For an optional "None"/"ללא" choice, give the item a sentinel value like `"none"`, set the Select root `value={field.value || "none"}`, and convert back on submit (`val !== "none" ? val : undefined`). Never render a `SelectItem value=""`.
