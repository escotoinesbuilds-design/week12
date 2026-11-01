"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  compareProviders,
  formatKm,
  formatMxn,
  genderLabel,
  genderPreferences,
  PatientPreferences,
  Provider,
  ProviderComparison,
  scheduleLabel,
  schedules,
  validatePreferences,
} from "@/lib/comparison";
import { demoProviders } from "@/lib/demo-providers";

type FormValues = {
  budgetMxn: string;
  maxDistanceKm: string;
  schedule: string;
  genderPreference: string;
};

type ProviderResponse = {
  providers: Provider[];
  source: "local" | "supabase";
};

const initialForm: FormValues = {
  budgetMxn: "",
  maxDistanceKm: "",
  schedule: "",
  genderPreference: "sin-preferencia",
};

const statusLabels = {
  coincide: "Coincide",
  "no-coincide": "No coincide",
  desconocido: "Desconocido",
} as const;

const scheduleOptions = {
  manana: "Por la mañana",
  tarde: "Por la tarde",
  noche: "Por la noche",
} as const;

function isProviderResponse(value: unknown): value is ProviderResponse {
  if (typeof value !== "object" || value === null || !("providers" in value) || !("source" in value)) {
    return false;
  }
  return (
    Array.isArray(value.providers) &&
    (value.source === "local" || value.source === "supabase")
  );
}

export default function Home() {
  const [form, setForm] = useState<FormValues>(initialForm);
  const [providers, setProviders] = useState<Provider[]>(demoProviders);
  const [source, setSource] = useState<"local" | "supabase">("local");
  const [providerError, setProviderError] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PatientPreferences, string>>
  >({});
  const [comparisons, setComparisons] = useState<ProviderComparison[] | null>(
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const focusInvalidField = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadProviderRecords() {
      try {
        const response = await fetch("/api/providers", { cache: "no-store" });
        const body: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof body === "object" && body !== null && "error" in body
              ? String(body.error)
              : "No se pudieron cargar los perfiles.";
          throw new Error(message);
        }
        if (!isProviderResponse(body)) {
          throw new Error("La respuesta de perfiles no tiene un formato válido.");
        }

        if (active) {
          setProviders(body.providers);
          setSource(body.source);
        }
      } catch (error) {
        if (active) {
          setProviderError(
            error instanceof Error
              ? `${error.message} Se muestran los perfiles ficticios locales para que puedas probar la comparación.`
              : "No se pudieron cargar los perfiles. Se muestran los perfiles ficticios locales para que puedas probar la comparación.",
          );
        }
      } finally {
        if (active) setLoadingProviders(false);
      }
    }

    void loadProviderRecords();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focusInvalidField.current) return;

    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
    focusInvalidField.current = false;
  }, [errors]);

  function updateForm(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    focusInvalidField.current = false;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validatePreferences(form);

    if (!result.valid) {
      setErrors(result.errors);
      focusInvalidField.current = true;
      setComparisons(null);
      return;
    }

    setErrors({});
    focusInvalidField.current = false;
    setComparisons(compareProviders(providers, result.value));
  }

  function handleReset() {
    setForm(initialForm);
    setErrors({});
    focusInvalidField.current = false;
    setComparisons(null);
  }

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="RutaSalud, inicio">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>RutaSalud</span>
        </Link>
        <span className="header-note">Comparación transparente</span>
      </header>

      <main className="main-content mx-auto">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Opciones de atención, a tu manera</p>
          <h1 id="page-title">Encuentra atención que se ajuste a ti</h1>
          <p className="intro-copy">
            Compara opciones según tus necesidades. Tú decides qué hacer
            después.
          </p>
        </section>

        <aside className="data-notice" aria-label="Aviso sobre los datos">
          <span className="notice-label">
            {source === "local" ? "DATOS SIMULADOS" : "DATOS DE DEMOSTRACIÓN"}
          </span>
          <span>
            {source === "local"
              ? "Todos los perfiles son ficticios; no representan doctores, citas ni precios reales."
              : "Los perfiles no representan una recomendación ni disponibilidad en tiempo real. Revisa el estado de cada dato."}
          </span>
        </aside>

        {providerError && (
          <p className="provider-error" role="status">
            {providerError}
          </p>
        )}

        <div className="workspace">
          <section className="preferences-panel" aria-labelledby="preferences-title">
            <div className="panel-heading">
              <span className="step-label">PASO 1</span>
              <h2 id="preferences-title">Tus preferencias</h2>
              <p>Indica tus límites. No guardamos lo que escribes.</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="budgetMxn">Presupuesto máximo</label>
                <div className="input-wrap">
                  <span aria-hidden="true">$</span>
                  <input
                    id="budgetMxn"
                    name="budgetMxn"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="100000"
                    step="0.01"
                    placeholder="Ej. 1,000"
                    value={form.budgetMxn}
                    onChange={(event) => updateForm("budgetMxn", event.target.value)}
                    aria-invalid={Boolean(errors.budgetMxn)}
                    aria-describedby={
                      errors.budgetMxn ? "budgetMxn-error budgetMxn-hint" : "budgetMxn-hint"
                    }
                    required
                  />
                  <span className="input-unit">MXN</span>
                </div>
                <p className="field-hint" id="budgetMxn-hint">
                  De $1 a $100,000 MXN
                </p>
                {errors.budgetMxn && (
                  <p className="field-error" id="budgetMxn-error">
                    {errors.budgetMxn}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="maxDistanceKm">Distancia máxima</label>
                <div className="input-wrap">
                  <input
                    id="maxDistanceKm"
                    name="maxDistanceKm"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Ej. 5"
                    value={form.maxDistanceKm}
                    onChange={(event) =>
                      updateForm("maxDistanceKm", event.target.value)
                    }
                    aria-invalid={Boolean(errors.maxDistanceKm)}
                    aria-describedby={
                      errors.maxDistanceKm
                        ? "maxDistanceKm-error maxDistanceKm-hint"
                        : "maxDistanceKm-hint"
                    }
                    required
                  />
                  <span className="input-unit">km</span>
                </div>
                <p className="field-hint" id="maxDistanceKm-hint">
                  De 0 a 100 km
                </p>
                {errors.maxDistanceKm && (
                  <p className="field-error" id="maxDistanceKm-error">
                    {errors.maxDistanceKm}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="schedule">Horario preferido</label>
                <select
                  id="schedule"
                  name="schedule"
                  value={form.schedule}
                  onChange={(event) => updateForm("schedule", event.target.value)}
                  aria-invalid={Boolean(errors.schedule)}
                  aria-describedby={errors.schedule ? "schedule-error" : undefined}
                  required
                >
                  <option value="" disabled>
                    Elige un horario
                  </option>
                  {schedules.map((schedule) => (
                    <option key={schedule} value={schedule}>
                      {scheduleOptions[schedule]}
                    </option>
                  ))}
                </select>
                {errors.schedule && (
                  <p className="field-error" id="schedule-error">
                    {errors.schedule}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="genderPreference">
                  Preferencia de profesional
                </label>
                <select
                  id="genderPreference"
                  name="genderPreference"
                  value={form.genderPreference}
                  onChange={(event) =>
                    updateForm("genderPreference", event.target.value)
                  }
                  aria-invalid={Boolean(errors.genderPreference)}
                  aria-describedby={
                    errors.genderPreference ? "genderPreference-error" : undefined
                  }
                  required
                >
                  {genderPreferences.map((preference) => (
                    <option key={preference} value={preference}>
                      {preference === "sin-preferencia"
                        ? "Sin preferencia"
                        : `Prefiero ${genderLabel(preference)}`}
                    </option>
                  ))}
                </select>
                {errors.genderPreference && (
                  <p className="field-error" id="genderPreference-error">
                    {errors.genderPreference}
                  </p>
                )}
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={loadingProviders}
              >
                {loadingProviders ? "Cargando perfiles…" : "Comparar opciones"}
              </button>
              {comparisons && (
                <button className="text-button" type="button" onClick={handleReset}>
                  Borrar preferencias y empezar de nuevo
                </button>
              )}
            </form>

            <p className="privacy-note">
              Tus preferencias sólo se usan en esta pantalla y no se envían ni
              se guardan.
            </p>
          </section>

          <section className="results-panel" aria-labelledby="results-title">
            <div className="results-heading">
              <div>
                <span className="step-label">PASO 2</span>
                <h2 id="results-title">Resultados comparados</h2>
                <p>
                  Coincidencias, compromisos e información faltante
                </p>
              </div>
              {comparisons && comparisons.length > 0 && (
                <span className="result-count">
                  {comparisons.length} perfiles · todos visibles
                </span>
              )}
            </div>

            {loadingProviders && (
              <div className="empty-state" role="status">
                Cargando perfiles de demostración…
              </div>
            )}

            {!loadingProviders && comparisons === null && (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">
                  ↗
                </span>
                <h3>Empieza por tus preferencias</h3>
                <p>
                  Al comparar, verás cada perfil con sus coincidencias,
                  diferencias y datos desconocidos. Ninguna opción se oculta
                  por no coincidir.
                </p>
              </div>
            )}

            {!loadingProviders && comparisons?.length === 0 && (
              <div className="empty-state" role="status">
                <h3>No hay perfiles para comparar</h3>
                <p>
                  No se recibieron registros. No podemos hacer una comparación
                  hasta que haya datos disponibles.
                </p>
              </div>
            )}

            {!loadingProviders && comparisons && comparisons.length > 0 && (
              <div className="comparison-list" aria-live="polite">
                {comparisons.map((comparison) => (
                  <ComparisonCard
                    comparison={comparison}
                    key={comparison.provider.id}
                  />
                ))}
                <p className="choice-note">
                  Esta comparación no es un diagnóstico ni una recomendación.
                  Confirma directamente cualquier dato que necesites. Tú
                  decides; aquí no se agenda ni se contacta a nadie.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>RutaSalud · Proyecto de demostración</span>
        <span>
          Sin diagnósticos, disponibilidad garantizada ni reservas automáticas.
        </span>
      </footer>
    </div>
  );
}

function ComparisonCard({
  comparison,
}: {
  comparison: ProviderComparison;
}) {
  const { provider, constraints } = comparison;
  const compromises = constraints.filter(
    (constraint) => constraint.status !== "coincide",
  );
  const isSimulated = provider.dataStatus === "simulated";

  return (
    <article className="provider-card">
      <div className="provider-card-top">
        <div className="provider-avatar" aria-hidden="true">
          +
        </div>
        <div className="provider-title">
          <div className="provider-name-row">
            <h3>{provider.name}</h3>
            <span className={`data-tag ${isSimulated ? "simulated" : "unverified"}`}>
              {isSimulated ? "Perfil ficticio" : "Datos no verificados"}
            </span>
          </div>
          <div className="provider-facts">
            <span>
              Precio:{" "}
              {isSimulated && provider.consultationPriceMxn !== null
                ? formatMxn(provider.consultationPriceMxn)
                : "desconocido"}
            </span>
            <span>
              Distancia:{" "}
              {isSimulated && provider.distanceKm !== null
                ? formatKm(provider.distanceKm)
                : "desconocida"}
            </span>
            <span>
              Horario:{" "}
              {isSimulated && provider.schedules !== null
                ? provider.schedules.map((item) => scheduleLabel(item)).join(", ")
                : "desconocido"}
            </span>
            <span>
              Profesional:{" "}
              {isSimulated && provider.gender !== null
                ? genderLabel(provider.gender)
                : "desconocido"}
            </span>
          </div>
        </div>
      </div>

      <div className="constraint-list">
        {constraints.map((constraint) => (
          <div className="constraint-row" key={constraint.key}>
            <span className={`status-mark ${constraint.status}`}>
              <span aria-hidden="true">
                {constraint.status === "coincide"
                  ? "✓"
                  : constraint.status === "no-coincide"
                    ? "!"
                    : "?"}
              </span>
              {statusLabels[constraint.status]}
            </span>
            <div>
              <h4>{constraint.label}</h4>
              <p>{constraint.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`tradeoff-note ${compromises.length === 0 ? "all-match" : ""}`}
      >
        <strong>
          {compromises.length === 0
            ? "Según los datos simulados, coincide con tus criterios."
            : "Compromisos y datos por confirmar"}
        </strong>
        {compromises.length > 0 && (
          <ul>
            {compromises.map((item) => (
              <li key={item.key}>{item.explanation}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
