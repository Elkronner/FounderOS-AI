const test = require("node:test");
const assert = require("node:assert/strict");

const data = require("./gameform-data.ts");

test("returns a module by slug", () => {
  assert.equal(data.getModuleBySlug("pricing")?.title, "Precificação");
});

test("calculates overall completion", () => {
  assert.ok(data.getOverallCompletion() > 60);
});

test("groups maturity by area", () => {
  assert.ok(data.getAreaMaturity().some((item) => item.area === "Financeiro"));
});

test("filters modules by status", () => {
  assert.ok(data.getModulesByStatus("concluido").length > 1);
});

test("resolves role landing page", () => {
  assert.equal(data.getRoleLanding("admin"), "/app/admin");
});
