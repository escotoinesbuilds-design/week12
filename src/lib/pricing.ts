export const pricingPlans = [
  {
    id: "basic",
    name: "Básico",
    priceMxn: 0,
    description: "Perfil básico e inclusión justa en búsquedas.",
    doctorLimit: null,
    advancedFeaturesAvailable: false,
  },
  {
    id: "individual-essentials",
    name: "Individual Essentials",
    priceMxn: 499,
    description: "Precio propuesto para profesionales individuales.",
    doctorLimit: 1,
    advancedFeaturesAvailable: false,
  },
  {
    id: "clinic-essentials",
    name: "Clinic Essentials",
    priceMxn: 699,
    description: "Precio propuesto para clínicas de hasta 3 profesionales.",
    doctorLimit: 3,
    advancedFeaturesAvailable: false,
  },
  {
    id: "clinic-advanced",
    name: "Clinic Advanced",
    priceMxn: 1299,
    description:
      "Precio propuesto para hasta 5 profesionales; las funciones avanzadas no están verificadas ni disponibles.",
    doctorLimit: 5,
    advancedFeaturesAvailable: false,
  },
] as const;

export type PricingPlanId = (typeof pricingPlans)[number]["id"];

export type PricingAssumptions = {
  planId: PricingPlanId;
  additionalAttendedConsultations: number;
  contributionProfitPerConsultation: number;
  staffHoursSaved: number;
  staffHourlyCost: number;
  monthlyClinicImplementationCost: number;
  monthlyPlatformOnboardingSupportCost: number;
};

export type PricingNumericField = Exclude<keyof PricingAssumptions, "planId">;
export type PricingValidationErrors = Partial<
  Record<PricingNumericField | "planId", string>
>;

export type PricingCalculation = {
  consultationContribution: number;
  administrativeSavings: number;
  totalClinicBenefit: number;
  subscriptionExpense: number;
  clinicImplementationExpense: number;
  totalClinicExpense: number;
  netClinicValue: number;
  benefitToSubscriptionRatio: number | null;
  netRoiPercent: number | null;
  platformMonthlyContribution: number;
};

export const defaultPricingAssumptions: PricingAssumptions = {
  planId: "clinic-essentials",
  additionalAttendedConsultations: 4,
  contributionProfitPerConsultation: 450,
  staffHoursSaved: 6,
  staffHourlyCost: 110,
  monthlyClinicImplementationCost: 0,
  monthlyPlatformOnboardingSupportCost: 240,
};

export const pricingInputRules: Record<
  PricingNumericField,
  { min: number; max: number; step: number; maxLabel: string }
> = {
  additionalAttendedConsultations: {
    min: 0,
    max: 10000,
    step: 1,
    maxLabel: "10,000 consultas",
  },
  contributionProfitPerConsultation: {
    min: 0,
    max: 1000000,
    step: 0.01,
    maxLabel: "$1,000,000 MXN",
  },
  staffHoursSaved: {
    min: 0,
    max: 744,
    step: 0.25,
    maxLabel: "744 horas",
  },
  staffHourlyCost: {
    min: 0,
    max: 100000,
    step: 0.01,
    maxLabel: "$100,000 MXN/h",
  },
  monthlyClinicImplementationCost: {
    min: 0,
    max: 10000000,
    step: 0.01,
    maxLabel: "$10,000,000 MXN",
  },
  monthlyPlatformOnboardingSupportCost: {
    min: 0,
    max: 10000000,
    step: 0.01,
    maxLabel: "$10,000,000 MXN",
  },
};

function isPricingPlanId(value: unknown): value is PricingPlanId {
  return pricingPlans.some((plan) => plan.id === value);
}

export function validatePricingAssumptions(
  assumptions: PricingAssumptions,
): PricingValidationErrors {
  const errors: PricingValidationErrors = {};

  if (!isPricingPlanId(assumptions.planId)) {
    errors.planId = "Selecciona un plan disponible.";
  }

  for (const field of Object.keys(pricingInputRules) as PricingNumericField[]) {
    const value = assumptions[field];
    const rule = pricingInputRules[field];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < rule.min ||
      value > rule.max
    ) {
      errors[field] = `Ingresa un valor entre ${rule.min.toLocaleString("es-MX")} y ${rule.maxLabel}.`;
      continue;
    }

    if (
      field === "additionalAttendedConsultations" &&
      !Number.isInteger(value)
    ) {
      errors[field] = "Ingresa un número entero de consultas atendidas.";
    }
  }

  return errors;
}

export function calculatePricing(
  assumptions: PricingAssumptions,
): PricingCalculation {
  const errors = validatePricingAssumptions(assumptions);
  if (Object.keys(errors).length > 0) {
    throw new Error("No se puede calcular con supuestos inválidos.");
  }

  const plan = pricingPlans.find(({ id }) => id === assumptions.planId);
  if (!plan) {
    throw new Error("El plan seleccionado no está disponible.");
  }

  const consultationContribution =
    assumptions.additionalAttendedConsultations *
    assumptions.contributionProfitPerConsultation;
  const administrativeSavings =
    assumptions.staffHoursSaved * assumptions.staffHourlyCost;
  const totalClinicBenefit =
    consultationContribution + administrativeSavings;
  const subscriptionExpense = plan.priceMxn;
  const clinicImplementationExpense =
    assumptions.monthlyClinicImplementationCost;
  const totalClinicExpense =
    subscriptionExpense + clinicImplementationExpense;
  const netClinicValue = totalClinicBenefit - totalClinicExpense;

  return {
    consultationContribution,
    administrativeSavings,
    totalClinicBenefit,
    subscriptionExpense,
    clinicImplementationExpense,
    totalClinicExpense,
    netClinicValue,
    benefitToSubscriptionRatio:
      subscriptionExpense > 0
        ? totalClinicBenefit / subscriptionExpense
        : null,
    netRoiPercent:
      totalClinicExpense > 0
        ? (netClinicValue / totalClinicExpense) * 100
        : null,
    platformMonthlyContribution:
      subscriptionExpense -
      assumptions.monthlyPlatformOnboardingSupportCost,
  };
}
