import { assertEquals } from "../src/dev_deps.ts";

Deno.test("Handle", async (t) => {
  await t.step({
    name: "Do something",
    fn: async () => {
      await assertEquals(true, true, "True is equal");
    },
  });

  await t.step({
    name: "another",
    fn: async () => {
      await assertEquals(true, true, "Not equals");
    },
  });
});
