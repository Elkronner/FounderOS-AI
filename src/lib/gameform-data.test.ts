import { describe, expect, it } from "vitest";

import {
  getAreaMaturity,
  getModuleBySlug,
  getModulesByStatus,
  getOverallCompletion,
  getRoleLanding,
} from "@/lib/gameform-data";

describe("gameform data helpers", () => {
  it("returns a module by slug", () => {
    expect(getModuleBySlug("pricing")?.title).toBe("Precificação");
  });

  it("calculates overall completion", () => {
    expect(getOverallCompletion()).toBeGreaterThan(60);
  });

  it("groups maturity by area", () => {
    expect(getAreaMaturity().some((item) => item.area === "Financeiro")).toBe(true);
  });

  it("filters modules by status", () => {
    expect(getModulesByStatus("concluido").length).toBeGreaterThan(1);
  });

  it("resolves role landing page", () => {
    expect(getRoleLanding("admin")).toBe("/app/admin");
  });
});
