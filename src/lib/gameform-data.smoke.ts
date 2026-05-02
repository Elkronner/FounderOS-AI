import assert from "node:assert/strict";

import {
  getAreaMaturity,
  getModuleBySlug,
  getModulesByStatus,
  getOverallCompletion,
  getPhaseThreeModules,
  getPhaseTwoModules,
  getRoleLanding,
} from "./gameform-data";

assert.equal(getModuleBySlug("pricing")?.title, "Precificação");
assert.ok(getOverallCompletion() > 60);
assert.ok(getAreaMaturity().some((item) => item.area === "Financeiro"));
assert.ok(getModulesByStatus("concluido").length > 1);
assert.equal(getPhaseTwoModules().length, 11);
assert.equal(getPhaseThreeModules().length, 7);
assert.equal(getRoleLanding("admin"), "/app/admin");
assert.equal(getRoleLanding("mentor"), "/app/mentor");
assert.equal(getRoleLanding("member"), "/app");

console.log("Smoke tests passed.");
