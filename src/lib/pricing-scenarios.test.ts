import { describe, expect, it } from "vitest";
import { defaultPricingAssumptions } from "./pricing";
import {
  isValidScenarioName,
  parsePricingScenarios,
  serializePricingScenarios,
  type PricingScenario,
} from "./pricing-scenarios";

describe("pricing scenario storage validation", () => {
  const scenario: PricingScenario = {
    id: "scenario-1",
    name: "Clínica pequeña - base",
    assumptions: defaultPricingAssumptions,
  };

  it("round-trips valid named scenarios", () => {
    const raw = serializePricingScenarios([scenario]);

    expect(parsePricingScenarios(raw)).toEqual([scenario]);
  });

  it("rejects malformed, invalid, and unexpected scenario data", () => {
    expect(parsePricingScenarios("{")).toBeNull();
    expect(
      parsePricingScenarios(
        serializePricingScenarios([
          {
            ...scenario,
            assumptions: {
              ...defaultPricingAssumptions,
              staffHourlyCost: -1,
            },
          },
        ]),
      ),
    ).toBeNull();
    expect(
      parsePricingScenarios(
        JSON.stringify({
          version: 1,
          scenarios: [{ ...scenario, email: "private@example.test" }],
        }),
      ),
    ).toBeNull();
  });

  it("validates names without accepting empty or control-character values", () => {
    expect(isValidScenarioName("Escenario base")).toBe(true);
    expect(isValidScenarioName("   ")).toBe(false);
    expect(isValidScenarioName("nombre\ninseguro")).toBe(false);
    expect(isValidScenarioName("x".repeat(61))).toBe(false);
  });
});
