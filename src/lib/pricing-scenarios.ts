import {
  validatePricingAssumptions,
  type PricingAssumptions,
} from "./pricing";

export type PricingScenario = {
  id: string;
  name: string;
  assumptions: PricingAssumptions;
};

const assumptionKeys = [
  "planId",
  "additionalAttendedConsultations",
  "contributionProfitPerConsultation",
  "staffHoursSaved",
  "staffHourlyCost",
  "monthlyClinicImplementationCost",
  "monthlyPlatformOnboardingSupportCost",
] as const;

const scenarioKeys = ["id", "name", "assumptions"] as const;
const storedScenarioKeys = ["version", "scenarios"] as const;
const scenarioStorageVersion = 1;
const scenarioNameMaxLength = 60;

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === expectedKeys.length &&
    expectedKeys.every((key) => Object.hasOwn(value, key))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isValidScenarioName(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= scenarioNameMaxLength &&
    !/[\u0000-\u001f\u007f]/.test(trimmed)
  );
}

export function parsePricingScenarios(
  raw: string,
): PricingScenario[] | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    !isRecord(value) ||
    !hasExactKeys(value, storedScenarioKeys) ||
    value.version !== scenarioStorageVersion ||
    !Array.isArray(value.scenarios)
  ) {
    return null;
  }

  const scenarios: PricingScenario[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const candidate of value.scenarios) {
    if (!isRecord(candidate) || !hasExactKeys(candidate, scenarioKeys)) {
      return null;
    }

    const { id, name, assumptions } = candidate;
    if (
      typeof id !== "string" ||
      id.trim().length === 0 ||
      id.length > 100 ||
      typeof name !== "string" ||
      !isValidScenarioName(name) ||
      !isRecord(assumptions) ||
      !hasExactKeys(assumptions, assumptionKeys)
    ) {
      return null;
    }

    const typedAssumptions = assumptions as PricingAssumptions;
    if (Object.keys(validatePricingAssumptions(typedAssumptions)).length > 0) {
      return null;
    }

    const normalizedName = name.trim().toLocaleLowerCase("es-MX");
    if (ids.has(id) || names.has(normalizedName)) return null;

    ids.add(id);
    names.add(normalizedName);
    scenarios.push({
      id,
      name: name.trim(),
      assumptions: typedAssumptions,
    });
  }

  return scenarios;
}

export function serializePricingScenarios(
  scenarios: PricingScenario[],
): string {
  return JSON.stringify({ version: scenarioStorageVersion, scenarios });
}
