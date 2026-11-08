export const schedules = ["manana", "tarde", "noche"] as const;
export const genderPreferences = ["mujer", "hombre", "sin-preferencia"] as const;

export type Schedule = (typeof schedules)[number];
export type GenderPreference = (typeof genderPreferences)[number];
export type ProviderGender = Exclude<GenderPreference, "sin-preferencia"> | null;
export type ComparisonStatus = "coincide" | "no-coincide" | "desconocido";
export type ConstraintKey = "presupuesto" | "distancia" | "horario" | "genero";

export type PatientPreferences = {
  budgetMxn: number;
  maxDistanceKm: number;
  schedule: Schedule;
  genderPreference: GenderPreference;
};

export type ProviderNetworkStatus = "in-network" | "outside-network" | "unknown";

export type PriceEvidence = {
  source: string;
  confirmedAt: string;
};

export type ProviderFollowUp = {
  owner: string | null;
  nextAction: string | null;
  nextUpdateAt: string | null;
};

export type Provider = {
  id: string;
  name: string;
  consultationPriceMxn: number | null;
  distanceKm: number | null;
  schedules: readonly Schedule[] | null;
  gender: ProviderGender;
  dataStatus: "simulated" | "unverified";
  specialty?: string | null;
  priceEvidence?: PriceEvidence | null;
  networkStatus?: ProviderNetworkStatus;
  followUp?: ProviderFollowUp;
};

export type ConstraintResult = {
  key: ConstraintKey;
  label: string;
  status: ComparisonStatus;
  explanation: string;
};

export type ProviderComparison = {
  provider: Provider;
  constraints: ConstraintResult[];
};

export type PreferenceInput = {
  budgetMxn: unknown;
  maxDistanceKm: unknown;
  schedule: unknown;
  genderPreference: unknown;
};

export type ValidationResult =
  | { valid: true; value: PatientPreferences }
  | {
      valid: false;
      errors: Partial<Record<keyof PatientPreferences, string>>;
    };

const isSchedule = (value: unknown): value is Schedule =>
  value === "manana" || value === "tarde" || value === "noche";

const isGenderPreference = (value: unknown): value is GenderPreference =>
  value === "mujer" || value === "hombre" || value === "sin-preferencia";

function parseBoundedNumber(
  value: unknown,
  label: string,
  min: number,
  max: number,
): { value: number } | { error: string } {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    (typeof value === "string" && !/^\d+(?:\.\d{1,2})?$/.test(value.trim()))
  ) {
    return { error: `Ingresa un valor numérico válido para ${label.toLowerCase()}.` };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return {
      error: `${label} debe estar entre ${min} y ${max}${label === "Presupuesto" ? " MXN" : " km"}.`,
    };
  }

  return { value: parsed };
}

export function validatePreferences(input: PreferenceInput): ValidationResult {
  const errors: Partial<Record<keyof PatientPreferences, string>> = {};
  const budget = parseBoundedNumber(input.budgetMxn, "Presupuesto", 1, 100_000);
  const distance = parseBoundedNumber(input.maxDistanceKm, "Distancia máxima", 0, 100);
  const schedule = isSchedule(input.schedule) ? input.schedule : null;
  const genderPreference = isGenderPreference(input.genderPreference)
    ? input.genderPreference
    : null;

  if ("error" in budget) errors.budgetMxn = budget.error;
  if ("error" in distance) errors.maxDistanceKm = distance.error;
  if (schedule === null) errors.schedule = "Elige un horario válido.";
  if (genderPreference === null) {
    errors.genderPreference = "Elige una preferencia de profesional válida.";
  }

  if (
    Object.keys(errors).length > 0 ||
    "error" in budget ||
    "error" in distance ||
    schedule === null ||
    genderPreference === null
  ) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      budgetMxn: budget.value,
      maxDistanceKm: distance.value,
      schedule,
      genderPreference,
    },
  };
}

export function compareProvider(
  provider: Provider,
  preferences: PatientPreferences,
): ProviderComparison {
  if (provider.dataStatus === "unverified") {
    const labels: Array<[ConstraintKey, string]> = [
      ["presupuesto", "Presupuesto"],
      ["distancia", "Distancia"],
      ["horario", "Horario"],
      ["genero", "Preferencia de profesional"],
    ];

    return {
      provider,
      constraints: labels.map(([key, label]) => ({
        key,
        label,
        status: "desconocido",
        explanation: "La información de este perfil no está verificada; no se puede confirmar esta coincidencia.",
      })),
    };
  }

  const constraints: ConstraintResult[] = [
    provider.consultationPriceMxn === null
      ? {
          key: "presupuesto",
          label: "Presupuesto",
          status: "desconocido",
          explanation: "No hay un precio de demostración para comparar con tu presupuesto.",
        }
      : provider.consultationPriceMxn <= preferences.budgetMxn
        ? {
            key: "presupuesto",
            label: "Presupuesto",
            status: "coincide",
            explanation: `El precio de demostración de ${formatMxn(provider.consultationPriceMxn)} está dentro de tu límite de ${formatMxn(preferences.budgetMxn)}.`,
          }
        : {
            key: "presupuesto",
            label: "Presupuesto",
            status: "no-coincide",
            explanation: `El precio de demostración de ${formatMxn(provider.consultationPriceMxn)} supera tu límite de ${formatMxn(preferences.budgetMxn)}.`,
          },
    provider.distanceKm === null
      ? {
          key: "distancia",
          label: "Distancia",
          status: "desconocido",
          explanation: "No hay una distancia de demostración para comparar con tu límite.",
        }
      : provider.distanceKm <= preferences.maxDistanceKm
        ? {
            key: "distancia",
            label: "Distancia",
            status: "coincide",
            explanation: `La distancia ficticia de demostración de ${formatKm(provider.distanceKm)} (no calculada desde tu ubicación) está dentro de tu límite de ${formatKm(preferences.maxDistanceKm)}.`,
          }
        : {
            key: "distancia",
            label: "Distancia",
            status: "no-coincide",
            explanation: `La distancia ficticia de demostración de ${formatKm(provider.distanceKm)} (no calculada desde tu ubicación) supera tu límite de ${formatKm(preferences.maxDistanceKm)}.`,
          },
    provider.schedules === null
      ? {
          key: "horario",
          label: "Horario",
          status: "desconocido",
          explanation: "No hay horarios de demostración para verificar tu preferencia.",
        }
      : provider.schedules.includes(preferences.schedule)
        ? {
            key: "horario",
            label: "Horario",
            status: "coincide",
            explanation: `El horario de demostración incluye ${scheduleLabel(preferences.schedule)}.`,
          }
        : {
            key: "horario",
            label: "Horario",
            status: "no-coincide",
            explanation: `El horario de demostración no incluye ${scheduleLabel(preferences.schedule)}.`,
          },
    provider.gender === null
      ? {
          key: "genero",
          label: "Preferencia de profesional",
          status: "desconocido",
          explanation: "No se indica el género del perfil de demostración; no se puede comparar esta preferencia.",
        }
      : preferences.genderPreference === "sin-preferencia" ||
          provider.gender === preferences.genderPreference
        ? {
            key: "genero",
            label: "Preferencia de profesional",
            status: "coincide",
            explanation:
              preferences.genderPreference === "sin-preferencia"
                ? `No indicaste preferencia; el perfil de demostración indica ${genderLabel(provider.gender)}.`
                : `El perfil de demostración indica ${genderLabel(provider.gender)}, como prefieres.`,
          }
        : {
            key: "genero",
            label: "Preferencia de profesional",
            status: "no-coincide",
            explanation: `El perfil de demostración indica ${genderLabel(provider.gender)}; tu preferencia es ${genderLabel(preferences.genderPreference)}.`,
          },
  ];

  return { provider, constraints };
}

export function compareProviders(
  providers: readonly Provider[],
  preferences: PatientPreferences,
): ProviderComparison[] {
  return providers.map((provider) => compareProvider(provider, preferences));
}

export function formatMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatKm(distance: number): string {
  return `${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(distance)} km`;
}

export function scheduleLabel(schedule: Schedule): string {
  return { manana: "la mañana", tarde: "la tarde", noche: "la noche" }[schedule];
}

export function genderLabel(gender: Exclude<GenderPreference, "sin-preferencia">): string {
  return { mujer: "mujer", hombre: "hombre" }[gender];
}
