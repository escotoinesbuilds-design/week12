import type { Provider } from "@/lib/comparison";

export const PRICE_FRESHNESS_DAYS = 30;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export type PriceReliability =
  | "simulated"
  | "clinic-confirmed"
  | "unconfirmed"
  | "outdated"
  | "missing";

export type DemoAppointmentStatus =
  | "not-started"
  | "prepared"
  | "sent"
  | "awaiting-clinic"
  | "confirmed";

export type DemoAppointmentAction =
  | "prepare"
  | "simulate-send"
  | "simulate-clinic-receipt"
  | "simulate-clinic-acceptance";

export function hasPriceEvidence(provider: Provider, now: number = Date.now()): boolean {
  const evidence = provider.priceEvidence;
  if (!evidence?.source.trim() || !evidence.confirmedAt.trim()) return false;
  const confirmedAt = Date.parse(evidence.confirmedAt);
  return Number.isFinite(confirmedAt) && confirmedAt <= now;
}

export function getPriceReliability(
  provider: Provider,
  now: number = Date.now(),
): PriceReliability {
  if (provider.consultationPriceMxn === null) return "missing";
  if (
    !Number.isFinite(provider.consultationPriceMxn) ||
    provider.consultationPriceMxn < 0
  ) {
    return "unconfirmed";
  }
  if (provider.dataStatus === "simulated") return "simulated";

  if (!hasPriceEvidence(provider, now)) return "unconfirmed";
  const evidence = provider.priceEvidence;
  if (!evidence) return "unconfirmed";
  const confirmedAt = Date.parse(evidence.confirmedAt);
  const age = now - confirmedAt;
  return age > PRICE_FRESHNESS_DAYS * DAY_IN_MILLISECONDS
    ? "outdated"
    : "clinic-confirmed";
}

export function getProviderFactStatus(
  provider: Provider,
  value: string | number | null | undefined,
): "simulated" | "unverified" | "missing" {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && !Number.isFinite(value))
  ) {
    return "missing";
  }
  return provider.dataStatus;
}

export function transitionDemoAppointment(
  status: DemoAppointmentStatus,
  action: DemoAppointmentAction,
): DemoAppointmentStatus {
  const transitions: Record<
    DemoAppointmentStatus,
    Partial<Record<DemoAppointmentAction, DemoAppointmentStatus>>
  > = {
    "not-started": { prepare: "prepared" },
    prepared: { "simulate-send": "sent" },
    sent: { "simulate-clinic-receipt": "awaiting-clinic" },
    "awaiting-clinic": { "simulate-clinic-acceptance": "confirmed" },
    confirmed: {},
  };
  const nextStatus = transitions[status][action];

  if (!nextStatus) {
    throw new Error(`Invalid simulated appointment transition: ${status} -> ${action}`);
  }

  return nextStatus;
}

export function isOutsideNetwork(provider: Provider): boolean {
  return provider.networkStatus === "outside-network";
}
