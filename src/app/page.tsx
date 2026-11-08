"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  compareProviders,
  formatKm,
  formatMxn,
  genderLabel,
  genderPreferences,
  type ComparisonSummary,
  PatientPreferences,
  Provider,
  ProviderComparison,
  schedules,
  summarizeComparisons,
  validatePreferences,
} from "@/lib/comparison";
import { demoProviders } from "@/lib/demo-providers";
import {
  type DemoAppointmentAction,
  type DemoAppointmentStatus,
  getPriceReliability,
  getProviderFactStatus,
  hasPriceEvidence,
  isOutsideNetwork,
  type PriceReliability,
  transitionDemoAppointment,
} from "@/lib/handoff";

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

const priceStatusLabels: Record<PriceReliability, string> = {
  simulated: "Precio simulado · no confirmado",
  "clinic-confirmed": "Confirmado por la clínica",
  unconfirmed: "Precio no confirmado",
  outdated: "Precio desactualizado · no confirmado",
  missing: "Precio no disponible",
};

const appointmentStatusLabels: Record<DemoAppointmentStatus, string> = {
  "not-started": "Aún no preparada",
  prepared: "Solicitud preparada · SIMULACIÓN",
  sent: "Solicitud enviada · SIMULACIÓN (no se envió)",
  "awaiting-clinic": "Respuesta pendiente · SIMULACIÓN (sin contacto real)",
  confirmed: "Cita confirmada · SIMULACIÓN (no existe reserva real)",
};

const appointmentSteps: Array<{
  status: Exclude<DemoAppointmentStatus, "not-started">;
  label: string;
}> = [
  { status: "prepared", label: "Solicitud preparada" },
  { status: "sent", label: "Solicitud enviada" },
  { status: "awaiting-clinic", label: "Respuesta de la clínica" },
  { status: "confirmed", label: "Cita confirmada" },
];

const demoAppointmentActions: Partial<
  Record<DemoAppointmentStatus, { action: DemoAppointmentAction; label: string }>
> = {
  "not-started": {
    action: "prepare",
    label: "Preparar solicitud (simulación)",
  },
  prepared: {
    action: "simulate-send",
    label: "Simular envío (no se enviará)",
  },
  sent: {
    action: "simulate-clinic-receipt",
    label: "Simular respuesta (sin contacto real)",
  },
  "awaiting-clinic": {
    action: "simulate-clinic-acceptance",
    label: "Simular aceptación (sin cita real)",
  },
};

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
  const comparisonSummary =
    comparisons === null ? null : summarizeComparisons(comparisons);

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
              : "Los perfiles no representan una recomendación ni disponibilidad en tiempo real. Revisa cada dato y confirma precios directamente con la clínica."}
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
                  De 0 a 100 km. En esta demo son valores ficticios; no usamos
                  tu ubicación.
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
              <div
                className="comparison-list"
                id="comparison-options"
                aria-live="polite"
              >
                {comparisonSummary && (
                  <ComparisonSummaryPanel summary={comparisonSummary} />
                )}
                {comparisons.map((comparison) => (
                  <ComparisonCard
                    comparison={comparison}
                    key={comparison.provider.id}
                  />
                ))}
                <ClarityFeedback />
                <p className="choice-note">
                  Esta comparación no es un diagnóstico ni una recomendación.
                  Confirma precios y horarios directamente. Tú decides; aquí no
                  se contacta a nadie ni se agenda una cita real.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>RutaSalud · Proyecto de demostración</span>
        <span>
          Sin diagnósticos ni disponibilidad garantizada. Las citas de esta demo
          no son reservas reales.
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
  const [demoStatus, setDemoStatus] =
    useState<DemoAppointmentStatus>("not-started");
  const compromises = constraints.filter(
    (constraint) => constraint.status !== "coincide",
  );
  const isCompleteMatch = compromises.length === 0;
  const isSimulated = provider.dataStatus === "simulated";
  const outsideNetwork = isOutsideNetwork(provider);
  const priceReliability = getPriceReliability(provider);
  const hasEvidence = hasPriceEvidence(provider);
  const nextAction = demoAppointmentActions[demoStatus];

  function advanceDemo() {
    if (!nextAction) return;
    setDemoStatus((current) =>
      transitionDemoAppointment(current, nextAction.action),
    );
  }

  return (
    <article
      className={`provider-card ${isCompleteMatch ? "complete-match" : "alternative-match"}`}
      aria-label={
        isCompleteMatch
          ? `${provider.name}: coincidencia completa`
          : `${provider.name}: alternativa, ${compromises.length} preferencias por revisar`
      }
    >
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
            <span className={`network-tag ${outsideNetwork ? "outside" : ""}`}>
              {outsideNetwork
                ? "Fuera de la red"
                : provider.networkStatus === "in-network"
                  ? "En la red"
                  : "Red no informada"}
              {isSimulated ? " · simulado" : ""}
            </span>
            <span className={`fit-badge ${isCompleteMatch ? "complete" : "alternative"}`}>
              {isCompleteMatch
                ? "Coincidencia completa"
                : `Alternativa · ${compromises.length} por revisar`}
            </span>
          </div>
        </div>
      </div>

      <div className="provider-facts" aria-label="Información del proveedor">
        <FactRow
          label="Especialidad"
          value={provider.specialty ?? null}
          status={getProviderFactStatus(provider, provider.specialty)}
        />
        <FactRow
          label="Horario"
          value={
            provider.schedules?.map((item) => scheduleOptions[item]).join(", ") ??
            null
          }
          status={getProviderFactStatus(
            provider,
            provider.schedules?.length ? provider.schedules.join(",") : null,
          )}
        />
        <FactRow
          label="Profesional"
          value={provider.gender ? genderLabel(provider.gender) : null}
          status={getProviderFactStatus(provider, provider.gender)}
        />
        <FactRow
          label="Distancia ficticia (no usa tu ubicación)"
          value={
            provider.distanceKm === null
              ? null
              : `${formatKm(provider.distanceKm)}${isSimulated ? " · simulada" : ""}`
          }
          status={getProviderFactStatus(provider, provider.distanceKm)}
        />
      </div>

      <PriceSummary
        provider={provider}
        reliability={priceReliability}
      />

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
        className={`tradeoff-note ${isCompleteMatch ? "all-match" : ""}`}
      >
        <strong>
          {isCompleteMatch
            ? "Según los datos simulados, coincide con tus criterios."
            : "Esta alternativa no cumple todas tus preferencias."}
        </strong>
        {!isCompleteMatch && (
          <ul>
            {compromises.map((constraint) => (
              <li key={constraint.key}>
                <strong>
                  {constraint.label}:{" "}
                  {statusLabels[constraint.status].toLocaleLowerCase("es-MX")}.
                </strong>{" "}
                {constraint.explanation}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="handoff-panel" aria-label={`Siguiente paso para ${provider.name}`}>
        <div className="handoff-heading">
          <div>
            <span className="step-label">SIGUIENTE PASO</span>
            <h4>Contacto y cita</h4>
          </div>
          <span className="simulation-label">SOLO SIMULACIÓN</span>
        </div>

        {outsideNetwork ? (
          <p className="network-explanation">
            Fuera de la red de RutaSalud. Si decides continuar, coordina y
            confirma la cita directamente con el proveedor. No rastreamos ese
            contacto; no hay un canal verificado disponible en esta demo.
          </p>
        ) : (
          <p className="network-explanation">
            Esta relación con la red también es simulada; RutaSalud no tiene un
            canal integrado para contactar a esta clínica.
          </p>
        )}

        <div className="follow-up-details">
          <p>
            <strong>Precio:</strong> {priceStatusLabels[priceReliability]}
          </p>
          {hasEvidence && provider.priceEvidence && (
            <p>
              <strong>Fuente:</strong> {provider.priceEvidence.source} ·{" "}
              <strong>Confirmado:</strong>{" "}
              {formatEvidenceDate(provider.priceEvidence.confirmedAt)}
            </p>
          )}
          <p>
            <strong>Aviso a la clínica:</strong> Pendiente; no integrado y no
            enviado.
          </p>
          <p>
            <strong>Responsable:</strong>{" "}
            {provider.followUp?.owner ?? "No asignado"}
          </p>
          <p>
            <strong>Próxima acción:</strong>{" "}
            {provider.followUp?.nextAction ?? "Por definir"}
          </p>
          <p>
            <strong>Próxima actualización:</strong>{" "}
            {provider.followUp?.nextUpdateAt
              ? formatEvidenceDate(provider.followUp.nextUpdateAt)
              : "Sin fecha asignada"}
          </p>
        </div>

        <ol className="appointment-progress" aria-label="Etapas de la solicitud simulada">
          {appointmentSteps.map((step) => {
            const stepIndex = appointmentSteps.findIndex(
              ({ status }) => status === step.status,
            );
            const activeIndex = appointmentSteps.findIndex(
              ({ status }) => status === demoStatus,
            );
            const isComplete = activeIndex >= stepIndex;

            return (
              <li
                className={isComplete ? "complete" : ""}
                key={step.status}
                aria-current={demoStatus === step.status ? "step" : undefined}
              >
                <strong>{step.label}</strong>
                <span>
                  {isComplete ? appointmentStatusLabels[step.status] : "Pendiente · simulado"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="workflow-status" aria-live="polite">
          {appointmentStatusLabels[demoStatus]}
        </p>
        <p className="simulation-disclaimer">
          Ninguna acción se envía a la clínica. No se preparan datos personales
          ni médicos y esta demo no crea una cita.
        </p>
        {nextAction ? (
          <button className="secondary-button" type="button" onClick={advanceDemo}>
            {nextAction.label}
          </button>
        ) : (
          <button
            className="text-button"
            type="button"
            onClick={() => setDemoStatus("not-started")}
          >
            Reiniciar demostración
          </button>
        )}
      </section>
    </article>
  );
}

function ComparisonSummaryPanel({
  summary,
}: {
  summary: ComparisonSummary;
}) {
  const hasCompleteMatch = summary.completeMatches.length > 0;

  return (
    <section
      className={`comparison-summary ${hasCompleteMatch ? "has-matches" : "no-matches"}`}
      aria-live="polite"
      aria-labelledby="comparison-summary-title"
    >
      <div>
        <span className="step-label">RESUMEN DE COINCIDENCIAS</span>
        <h3 id="comparison-summary-title">
          {hasCompleteMatch
            ? `${summary.completeMatches.length} opción${summary.completeMatches.length === 1 ? "" : "es"} coincide${summary.completeMatches.length === 1 ? "" : "n"} con todas tus preferencias`
            : "No encontramos una opción que coincida con todas tus preferencias"}
        </h3>
        <p>
          {summary.alternatives.length > 0
            ? `Mostramos ${summary.alternatives.length} alternativa${summary.alternatives.length === 1 ? "" : "s"} aunque tenga${summary.alternatives.length === 1 ? "" : "n"} aspectos que no coinciden o son desconocidos, para que puedas revisar los motivos y decidir.`
            : "Todas las opciones mostradas coinciden con tus criterios según la información disponible."}
        </p>
        {!hasCompleteMatch && (
          <p className="summary-next-step">
            Siguiente paso: revisa en cada alternativa qué preferencia no coincide
            o es desconocida, o cambia tus preferencias. Tú eliges; RutaSalud no
            selecciona una opción por ti.
          </p>
        )}
      </div>
      <nav className="summary-actions" aria-label="Opciones para continuar">
        {summary.alternatives.length > 0 && (
          <a href="#comparison-options">Revisar alternativas</a>
        )}
        <a href="#preferences-title">Cambiar preferencias</a>
      </nav>
    </section>
  );
}

function FactRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string | null;
  status: "simulated" | "unverified" | "missing";
}) {
  const statusText = {
    simulated: "Simulado",
    unverified: "No verificado",
    missing: "No disponible",
  }[status];

  return (
    <div className="provider-fact">
      <span className="provider-fact-label">{label}</span>
      <strong>{value ?? "Información no disponible"}</strong>
      <span className={`fact-status ${status}`}>{statusText}</span>
    </div>
  );
}

function PriceSummary({
  provider,
  reliability,
}: {
  provider: Provider;
  reliability: PriceReliability;
}) {
  const price = provider.consultationPriceMxn;
  const isEvidenceBased = reliability === "clinic-confirmed";
  const warning = !isEvidenceBased;

  return (
    <section className={`price-summary ${warning ? "warning" : "confirmed"}`}>
      <div className="price-heading">
        <span>Consulta</span>
        <strong>{price === null ? "Precio no disponible" : formatMxn(price)}</strong>
      </div>
      <span className={`price-status ${reliability}`}>
        {priceStatusLabels[reliability]}
      </span>
      {hasPriceEvidence(provider) && provider.priceEvidence && (
        <p className="price-evidence">
          Fuente: {provider.priceEvidence.source} · Última confirmación:{" "}
          {formatEvidenceDate(provider.priceEvidence.confirmedAt)}
        </p>
      )}
      <p className="price-reconfirm">
        {isEvidenceBased
          ? "El precio puede cambiar; reconfírmalo directamente con la clínica antes de acudir."
          : "Confirma directamente cualquier precio con la clínica antes de acudir. Este dato no está confirmado."}
      </p>
    </section>
  );
}

function ClarityFeedback() {
  const [feedback, setFeedback] = useState<"clear" | "unclear" | null>(null);
  const [counts, setCounts] = useState({ clear: 0, unclear: 0 });

  function recordFeedback(value: "clear" | "unclear") {
    if (feedback) return;
    setFeedback(value);
    setCounts((current) => ({ ...current, [value]: current[value] + 1 }));
  }

  return (
    <section className="feedback-panel" aria-labelledby="feedback-title">
      <div>
        <h3 id="feedback-title">¿La información fue clara?</h3>
        <p>
          Conteo local de esta vista: clara {counts.clear} · no clara{" "}
          {counts.unclear}. No se envía ni guarda tu respuesta.
        </p>
      </div>
      <div className="feedback-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={feedback !== null}
          onClick={() => recordFeedback("clear")}
        >
          Sí, fue clara
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={feedback !== null}
          onClick={() => recordFeedback("unclear")}
        >
          No fue clara
        </button>
      </div>
      {feedback && (
        <p className="feedback-thanks" role="status">
          Gracias. Esta respuesta solo cuenta en esta vista y se borrará al
          recargar.
        </p>
      )}
    </section>
  );
}

function formatEvidenceDate(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "fecha no válida";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(parsed);
}
