import { describe, expect, it } from "vitest";
import {
  compareProvider,
  compareProviders,
  summarizeComparisons,
  validatePreferences,
} from "./comparison";
import type { PatientPreferences, Provider } from "./comparison";

const preferences: PatientPreferences = {
  budgetMxn: 1_000,
  maxDistanceKm: 5,
  schedule: "tarde",
  genderPreference: "mujer",
};

const provider: Provider = {
  id: "perfil-prueba",
  name: "Perfil ficticio de prueba",
  consultationPriceMxn: 950,
  distanceKm: 4,
  schedules: ["tarde"],
  gender: "mujer",
  dataStatus: "simulated",
};

describe("compareProvider", () => {
  it("reports a match for every stated constraint when demo values fit", () => {
    const result = compareProvider(provider, preferences);

    expect(result.constraints).toHaveLength(4);
    expect(result.constraints.map(({ status }) => status)).toEqual([
      "coincide",
      "coincide",
      "coincide",
      "coincide",
    ]);
  });

  it("reports mismatches and keeps providers visible when constraints do not fit", () => {
    const alternative = {
      ...provider,
      id: "perfil-alternativo",
      consultationPriceMxn: 1_500,
      distanceKm: 9,
      schedules: ["manana"] as const,
      gender: "hombre" as const,
    };

    const result = compareProviders([provider, alternative], preferences);

    expect(result).toHaveLength(2);
    expect(result[1].constraints.map(({ status }) => status)).toEqual([
      "no-coincide",
      "no-coincide",
      "no-coincide",
      "no-coincide",
    ]);
  });

  it("clarifies that demonstration distances are fictional and not location-based", () => {
    const withinLimit = compareProvider(provider, preferences);
    const beyondLimit = compareProvider(
      { ...provider, distanceKm: 9 },
      preferences,
    );

    expect(withinLimit.constraints[1].explanation).toContain(
      "no calculada desde tu ubicación",
    );
    expect(beyondLimit.constraints[1].explanation).toContain(
      "no calculada desde tu ubicación",
    );
    expect(withinLimit.constraints[1].explanation).toContain("ficticia");
    expect(beyondLimit.constraints[1].explanation).toContain("ficticia");
  });

  it("marks missing data unknown rather than matching, including with no preference", () => {
    const incomplete = {
      ...provider,
      consultationPriceMxn: null,
      distanceKm: null,
      schedules: null,
      gender: null,
    };
    const result = compareProvider(incomplete, {
      ...preferences,
      genderPreference: "sin-preferencia",
    });

    expect(result.constraints.map(({ status }) => status)).toEqual([
      "desconocido",
      "desconocido",
      "desconocido",
      "desconocido",
    ]);
    expect(result.constraints.every(({ explanation }) => explanation.length > 0)).toBe(
      true,
    );
  });

  it("does not compare unverified records as matches", () => {
    const result = compareProvider(
      { ...provider, dataStatus: "unverified" },
      preferences,
    );

    expect(result.constraints).toHaveLength(4);
    expect(result.constraints.every(({ status }) => status === "desconocido")).toBe(
      true,
    );
  });
});

describe("summarizeComparisons", () => {
  it("counts a provider as a complete match only when every preference matches", () => {
    const result = compareProvider(provider, preferences);
    const summary = summarizeComparisons([result]);

    expect(summary.completeMatches).toEqual([result]);
    expect(summary.alternatives).toEqual([]);
  });

  it("keeps mismatching and unknown records visible as alternatives", () => {
    const partial = compareProvider(
      { ...provider, schedules: null },
      preferences,
    );
    const summary = summarizeComparisons([partial]);

    expect(summary.completeMatches).toEqual([]);
    expect(summary.alternatives).toEqual([partial]);
  });

  it("reports zero complete matches while preserving every alternative", () => {
    const partial = compareProvider(
      { ...provider, consultationPriceMxn: 1_500 },
      preferences,
    );
    const unknown = compareProvider(
      { ...provider, id: "perfil-no-verificado", dataStatus: "unverified" },
      preferences,
    );
    const summary = summarizeComparisons([partial, unknown]);

    expect(summary.completeMatches).toHaveLength(0);
    expect(summary.alternatives).toEqual([partial, unknown]);
  });
});

describe("validatePreferences", () => {
  it("accepts valid bounded input and normalizes numeric strings", () => {
    expect(
      validatePreferences({
        budgetMxn: "1000",
        maxDistanceKm: "5.5",
        schedule: "tarde",
        genderPreference: "sin-preferencia",
      }),
    ).toEqual({
      valid: true,
      value: {
        budgetMxn: 1_000,
        maxDistanceKm: 5.5,
        schedule: "tarde",
        genderPreference: "sin-preferencia",
      },
    });
  });

  it("rejects malformed, out-of-range, and unsupported preference values", () => {
    const result = validatePreferences({
      budgetMxn: "-1",
      maxDistanceKm: "101",
      schedule: "madrugada",
      genderPreference: "otro",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(Object.keys(result.errors)).toEqual([
        "budgetMxn",
        "maxDistanceKm",
        "schedule",
        "genderPreference",
      ]);
    }
  });
});
