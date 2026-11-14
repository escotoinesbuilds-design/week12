"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  calculatePricing,
  pricingPlans,
  validatePricingAssumptions,
  type PricingAssumptions,
} from "@/lib/pricing";
import {
  isValidScenarioName,
  parsePricingScenarios,
  serializePricingScenarios,
  type PricingScenario,
} from "@/lib/pricing-scenarios";
import styles from "./pricing.module.css";

const storageKey = "rutasalud:pricing-scenarios:v1";
const storageEvent = "rutasalud:pricing-scenarios-change";
const loadingSnapshot = "__loading__";
const unavailableSnapshot = "__unavailable__";

type PersistenceState = "loading" | "ready" | "invalid" | "unavailable";

function subscribeToScenarios(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(storageEvent, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(storageEvent, onStoreChange);
  };
}

function getScenariosSnapshot(): string {
  try {
    return window.localStorage.getItem(storageKey) ?? "";
  } catch {
    return unavailableSnapshot;
  }
}

function getServerScenariosSnapshot(): string {
  return loadingSnapshot;
}

function money(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PricingScenarios({
  assumptions,
  canSave,
  onLoad,
}: {
  assumptions: PricingAssumptions;
  canSave: boolean;
  onLoad: (assumptions: PricingAssumptions) => void;
}) {
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioNameError, setScenarioNameError] = useState("");
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [storageMessage, setStorageMessage] = useState("");
  const scenariosSnapshot = useSyncExternalStore(
    subscribeToScenarios,
    getScenariosSnapshot,
    getServerScenariosSnapshot,
  );
  const parsedScenarios = useMemo(
    () =>
      scenariosSnapshot === "" ||
      scenariosSnapshot === loadingSnapshot ||
      scenariosSnapshot === unavailableSnapshot
        ? []
        : parsePricingScenarios(scenariosSnapshot),
    [scenariosSnapshot],
  );
  const persistenceState: PersistenceState =
    scenariosSnapshot === loadingSnapshot
      ? "loading"
      : scenariosSnapshot === unavailableSnapshot
        ? "unavailable"
        : scenariosSnapshot === "" || parsedScenarios !== null
          ? "ready"
          : "invalid";
  const scenarios = parsedScenarios ?? [];
  const selectedScenarios = scenarios.filter((scenario) =>
    selectedScenarioIds.includes(scenario.id),
  );

  function persistScenarios(next: PricingScenario[]): boolean {
    if (persistenceState !== "ready") {
      setStorageMessage(
        "El almacenamiento local no está disponible para guardar cambios.",
      );
      return false;
    }

    try {
      window.localStorage.setItem(storageKey, serializePricingScenarios(next));
      window.dispatchEvent(new Event(storageEvent));
      setStorageMessage("Escenarios guardados solo en este navegador.");
      return true;
    } catch {
      setStorageMessage(
        "No se pudo guardar en el navegador. Revisa el espacio disponible y vuelve a intentar.",
      );
      return false;
    }
  }

  function saveScenario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = scenarioName.trim();
    if (!isValidScenarioName(cleanName)) {
      setScenarioNameError(
        "Escribe un nombre de 1 a 60 caracteres, sin controles. No incluyas datos personales ni información de pacientes.",
      );
      return;
    }
    if (
      !canSave ||
      Object.keys(validatePricingAssumptions(assumptions)).length > 0
    ) {
      setScenarioNameError("Corrige los supuestos inválidos antes de guardar.");
      return;
    }
    if (
      scenarios.some(
        (scenario) =>
          scenario.name.toLocaleLowerCase("es-MX") ===
          cleanName.toLocaleLowerCase("es-MX"),
      )
    ) {
      setScenarioNameError(
        "Ya existe un escenario con ese nombre. Elige otro nombre.",
      );
      return;
    }
    if (persistenceState !== "ready") {
      setScenarioNameError(
        "El almacenamiento no está disponible. Tus supuestos no se guardaron.",
      );
      return;
    }

    const next = [
      ...scenarios,
      {
        id: window.crypto.randomUUID(),
        name: cleanName,
        assumptions,
      },
    ];

    if (persistScenarios(next)) {
      setScenarioName("");
      setScenarioNameError("");
    }
  }

  function loadScenario(scenario: PricingScenario) {
    onLoad(scenario.assumptions);
    setStorageMessage(`Se cargó “${scenario.name}” en la calculadora.`);
  }

  function deleteScenario(scenarioId: string) {
    const next = scenarios.filter((scenario) => scenario.id !== scenarioId);
    if (persistScenarios(next)) {
      setSelectedScenarioIds((current) =>
        current.filter((id) => id !== scenarioId),
      );
    }
  }

  function toggleScenarioComparison(scenarioId: string) {
    setSelectedScenarioIds((current) =>
      current.includes(scenarioId)
        ? current.filter((id) => id !== scenarioId)
        : [...current, scenarioId],
    );
  }

  function resetInvalidStorage() {
    try {
      window.localStorage.removeItem(storageKey);
      setSelectedScenarioIds([]);
      window.dispatchEvent(new Event(storageEvent));
      setStorageMessage("Se restableció el almacenamiento de escenarios.");
    } catch {
      setStorageMessage(
        "No se pudo restablecer el almacenamiento local del navegador.",
      );
    }
  }

  return (
    <section
      className={styles.scenarioSection}
      aria-labelledby="scenarios-title"
    >
      <div className={styles.sectionHeading}>
        <h2 id="scenarios-title">Escenarios guardados</h2>
        <p>
          Se almacenan solo en este navegador. No guardes nombres de pacientes,
          datos personales ni información clínica.
        </p>
      </div>

      <form className={styles.saveForm} onSubmit={saveScenario}>
        <div className={styles.scenarioNameField}>
          <label htmlFor="scenario-name">Nombre del escenario</label>
          <input
            id="scenario-name"
            name="scenarioName"
            type="text"
            maxLength={60}
            value={scenarioName}
            aria-invalid={Boolean(scenarioNameError)}
            aria-describedby={
              scenarioNameError
                ? "scenario-name-error"
                : "scenario-name-hint"
            }
            onChange={(event) => {
              setScenarioName(event.target.value);
              setScenarioNameError("");
            }}
          />
          <span id="scenario-name-hint">
            De 1 a 60 caracteres. Evita información personal.
          </span>
          {scenarioNameError && (
            <span className={styles.fieldError} id="scenario-name-error">
              {scenarioNameError}
            </span>
          )}
        </div>
        <button
          className={styles.primaryButton}
          type="submit"
          disabled={!canSave || persistenceState !== "ready"}
        >
          Guardar escenario
        </button>
      </form>

      {storageMessage && (
        <p className={styles.storageMessage} role="status">
          {storageMessage}
        </p>
      )}
      {persistenceState === "unavailable" && (
        <p className={styles.invalidNotice} role="status">
          El navegador no permitió acceder al almacenamiento local. Puedes usar
          la calculadora, pero no guardar escenarios.
        </p>
      )}
      {persistenceState === "invalid" && (
        <>
          <p className={styles.invalidNotice} role="status">
            Los escenarios guardados tienen un formato inválido; no se cargarán
            ni sobrescribirán sin tu acción.
          </p>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={resetInvalidStorage}
          >
            Restablecer escenarios dañados
          </button>
        </>
      )}
      {persistenceState === "loading" && (
        <p role="status">Cargando escenarios locales…</p>
      )}
      {persistenceState === "ready" && scenarios.length === 0 && (
        <p className={styles.emptyScenarios}>
          Aún no hay escenarios guardados en este navegador.
        </p>
      )}
      {scenarios.length > 0 && (
        <ul className={styles.scenarioList}>
          {scenarios.map((scenario) => (
            <li className={styles.scenarioRow} key={scenario.id}>
              <label className={styles.compareChoice}>
                <input
                  type="checkbox"
                  checked={selectedScenarioIds.includes(scenario.id)}
                  onChange={() => toggleScenarioComparison(scenario.id)}
                  aria-label={`Seleccionar ${scenario.name} para comparar`}
                />
                <span>{scenario.name}</span>
              </label>
              <div className={styles.scenarioActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => loadScenario(scenario)}
                >
                  Cargar
                </button>
                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={() => deleteScenario(scenario.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedScenarios.length >= 2 && (
        <section
          className={styles.comparison}
          aria-labelledby="scenario-comparison-title"
        >
          <h3 id="scenario-comparison-title">
            Comparación de escenarios hipotéticos
          </h3>
          <div className={styles.comparisonGrid}>
            {selectedScenarios.map((scenario) => {
              const result = calculatePricing(scenario.assumptions);
              const plan = pricingPlans.find(
                ({ id }) => id === scenario.assumptions.planId,
              );

              return (
                <article className={styles.comparisonCard} key={scenario.id}>
                  <h4>{scenario.name}</h4>
                  <p>
                    {plan?.name ?? "Plan"} ·{" "}
                    {money(result.subscriptionExpense)} / mes
                  </p>
                  <dl>
                    <div>
                      <dt>Beneficio estimado</dt>
                      <dd>{money(result.totalClinicBenefit)}</dd>
                    </div>
                    <div>
                      <dt>Valor neto estimado</dt>
                      <dd>{money(result.netClinicValue)}</dd>
                    </div>
                    <div>
                      <dt>ROI neto estimado</dt>
                      <dd>
                        {result.netRoiPercent === null
                          ? "No aplica"
                          : `${result.netRoiPercent.toFixed(2)}%`}
                      </dd>
                    </div>
                  </dl>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => loadScenario(scenario)}
                  >
                    Cargar este escenario
                  </button>
                </article>
              );
            })}
          </div>
          <p>
            Comparación hipotética con supuestos guardados en este navegador;
            no representa resultados observados.
          </p>
        </section>
      )}
    </section>
  );
}
