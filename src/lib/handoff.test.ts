import { describe, expect, it } from "vitest";
import type { Provider } from "@/lib/comparison";
import {
  getPriceReliability,
  getProviderFactStatus,
  hasPriceEvidence,
  isOutsideNetwork,
  PRICE_FRESHNESS_DAYS,
  transitionDemoAppointment,
} from "./handoff";

const now = Date.parse("2026-11-08T12:00:00.000Z");
const demoProvider: Provider = {
  id: "perfil-ficticio-prueba",
  name: "Perfil ficticio de prueba",
  consultationPriceMxn: 900,
  distanceKm: 3,
  schedules: ["tarde"],
  gender: null,
  dataStatus: "simulated",
};

describe("getPriceReliability", () => {
  it("never treats a simulated price as clinic-confirmed, even with evidence-like fields", () => {
    const result = getPriceReliability(
      {
        ...demoProvider,
        priceEvidence: {
          source: "SIMULADO",
          confirmedAt: new Date(now).toISOString(),
        },
      },
      now,
    );

    expect(result).toBe("simulated");
  });

  it("marks missing and unsupported unverified prices explicitly", () => {
    expect(
      getPriceReliability({ ...demoProvider, consultationPriceMxn: null }, now),
    ).toBe("missing");
    expect(
      getPriceReliability({ ...demoProvider, dataStatus: "unverified" }, now),
    ).toBe("unconfirmed");
    expect(
      getPriceReliability(
        {
          ...demoProvider,
          dataStatus: "unverified",
          priceEvidence: { source: "  ", confirmedAt: "invalid" },
        },
        now,
      ),
    ).toBe("unconfirmed");
  });

  it("requires a valid source and confirmation date and marks stale prices outdated", () => {
    const validEvidence = {
      source: "Confirmación directa de clínica",
      confirmedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const exactlyFreshEvidence = {
      source: validEvidence.source,
      confirmedAt: new Date(
        now - PRICE_FRESHNESS_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    expect(
      getPriceReliability(
        {
          ...demoProvider,
          dataStatus: "unverified",
          priceEvidence: validEvidence,
        },
        now,
      ),
    ).toBe("clinic-confirmed");
    expect(
      getPriceReliability(
        {
          ...demoProvider,
          dataStatus: "unverified",
          priceEvidence: exactlyFreshEvidence,
        },
        now,
      ),
    ).toBe("clinic-confirmed");
    expect(
      hasPriceEvidence(
        {
          ...demoProvider,
          dataStatus: "unverified",
          priceEvidence: validEvidence,
        },
        now,
      ),
    ).toBe(true);

    const staleEvidence = {
      source: validEvidence.source,
      confirmedAt: new Date(
        now - (PRICE_FRESHNESS_DAYS + 1) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
    expect(
      getPriceReliability(
        {
          ...demoProvider,
          dataStatus: "unverified",
          priceEvidence: staleEvidence,
        },
        now,
      ),
    ).toBe("outdated");
  });

  it("rejects future-dated or invalid price evidence", () => {
    const futureEvidence = {
      source: "Confirmación directa de clínica",
      confirmedAt: new Date(now + 1000).toISOString(),
    };
    const providerWithFutureEvidence = {
      ...demoProvider,
      dataStatus: "unverified" as const,
      priceEvidence: futureEvidence,
    };

    expect(getPriceReliability(providerWithFutureEvidence, now)).toBe(
      "unconfirmed",
    );
    expect(hasPriceEvidence(providerWithFutureEvidence, now)).toBe(false);
  });
});

describe("provider data status", () => {
  it("distinguishes simulated, unverified, and missing facts", () => {
    expect(getProviderFactStatus(demoProvider, demoProvider.name)).toBe(
      "simulated",
    );
    expect(
      getProviderFactStatus({ ...demoProvider, dataStatus: "unverified" }, "General"),
    ).toBe("unverified");
    expect(getProviderFactStatus(demoProvider, null)).toBe("missing");
  });

  it("identifies outside-network providers without implying contact", () => {
    expect(isOutsideNetwork({ ...demoProvider, networkStatus: "outside-network" })).toBe(
      true,
    );
    expect(isOutsideNetwork(demoProvider)).toBe(false);
  });
});

describe("simulated appointment workflow", () => {
  it("advances in order while keeping each state in the demo-only state machine", () => {
    const prepared = transitionDemoAppointment("not-started", "prepare");
    const sent = transitionDemoAppointment(prepared, "simulate-send");
    const awaitingClinic = transitionDemoAppointment(sent, "simulate-clinic-receipt");
    const confirmed = transitionDemoAppointment(
      awaitingClinic,
      "simulate-clinic-acceptance",
    );

    expect([prepared, sent, awaitingClinic, confirmed]).toEqual([
      "prepared",
      "sent",
      "awaiting-clinic",
      "confirmed",
    ]);
  });

  it("rejects skipped or repeated transitions instead of fabricating completion", () => {
    expect(() =>
      transitionDemoAppointment("not-started", "simulate-send"),
    ).toThrow(/Invalid simulated appointment transition/);
    expect(() =>
      transitionDemoAppointment("confirmed", "simulate-clinic-acceptance"),
    ).toThrow(/Invalid simulated appointment transition/);
  });
});
