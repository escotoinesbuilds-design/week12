import { describe, expect, it } from "vitest";
import {
  calculatePricing,
  defaultPricingAssumptions,
  validatePricingAssumptions,
} from "./pricing";

describe("pricing assumptions and calculations", () => {
  it("calculates clinic and platform economics separately", () => {
    const result = calculatePricing(defaultPricingAssumptions);

    expect(result.consultationContribution).toBe(1800);
    expect(result.administrativeSavings).toBe(660);
    expect(result.totalClinicBenefit).toBe(2460);
    expect(result.subscriptionExpense).toBe(699);
    expect(result.netClinicValue).toBe(1761);
    expect(result.benefitToSubscriptionRatio).toBeCloseTo(2460 / 699);
    expect(result.netRoiPercent).toBeCloseTo((1761 / 699) * 100);
    expect(result.platformMonthlyContribution).toBe(459);
  });

  it("includes the clinic's own monthly implementation expense in net value and ROI", () => {
    const result = calculatePricing({
      ...defaultPricingAssumptions,
      monthlyClinicImplementationCost: 100,
    });

    expect(result.totalClinicExpense).toBe(799);
    expect(result.netClinicValue).toBe(1661);
    expect(result.netRoiPercent).toBeCloseTo((1661 / 799) * 100);
  });

  it("does not divide by zero for the free plan", () => {
    const result = calculatePricing({
      ...defaultPricingAssumptions,
      planId: "basic",
      monthlyClinicImplementationCost: 0,
    });

    expect(result.subscriptionExpense).toBe(0);
    expect(result.benefitToSubscriptionRatio).toBeNull();
    expect(result.netRoiPercent).toBeNull();
  });

  it.each([
    ["negative consultations", { additionalAttendedConsultations: -1 }],
    ["fractional consultations", { additionalAttendedConsultations: 1.5 }],
    ["non-finite hourly cost", { staffHourlyCost: Number.POSITIVE_INFINITY }],
    ["out-of-range hours", { staffHoursSaved: 745 }],
  ])("rejects %s", (_description, change) => {
    const assumptions = { ...defaultPricingAssumptions, ...change };
    expect(Object.keys(validatePricingAssumptions(assumptions)).length).toBeGreaterThan(0);
    expect(() => calculatePricing(assumptions)).toThrow(
      "No se puede calcular con supuestos inválidos.",
    );
  });
});
