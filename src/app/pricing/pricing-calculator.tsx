"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculatePricing,
  defaultPricingAssumptions,
  pricingInputRules,
  pricingPlans,
  validatePricingAssumptions,
  type PricingAssumptions,
  type PricingNumericField,
  type PricingValidationErrors,
} from "@/lib/pricing";
import styles from "./pricing.module.css";
import PricingScenarios from "./pricing-scenarios";

const numericFields: Array<{
  key: PricingNumericField;
  label: string;
  unit: string;
  hint: string;
}> = [
  {
    key: "additionalAttendedConsultations",
    label: "Consultas adicionales atendidas",
    unit: "consultas al mes",
    hint: "Solo consultas que efectivamente se atendieron; usa un entero.",
  },
  {
    key: "contributionProfitPerConsultation",
    label: "Ganancia de contribución por consulta",
    unit: "MXN por consulta",
    hint: "Ganancia después de costos variables, no el precio cobrado.",
  },
  {
    key: "staffHoursSaved",
    label: "Horas del personal ahorradas",
    unit: "horas al mes",
    hint: "Estimación hipotética de tiempo administrativo liberado.",
  },
  {
    key: "staffHourlyCost",
    label: "Costo por hora del personal",
    unit: "MXN por hora",
    hint: "Costo por hora que la clínica asigna al tiempo del personal.",
  },
  {
    key: "monthlyClinicImplementationCost",
    label: "Implementación y soporte de la clínica",
    unit: "MXN al mes",
    hint: "Costo mensual estimado para la clínica; usa $0 si no aplica.",
  },
  {
    key: "monthlyPlatformOnboardingSupportCost",
    label: "Onboarding y soporte de RutaSalud",
    unit: "MXN por clínica al mes",
    hint: "Costo mensual estimado para RutaSalud, separado del valor de la clínica.",
  },
];

type RawNumericAssumptions = Record<PricingNumericField, string>;

function toRawAssumptions(
  assumptions: PricingAssumptions,
): RawNumericAssumptions {
  return {
    additionalAttendedConsultations: String(
      assumptions.additionalAttendedConsultations,
    ),
    contributionProfitPerConsultation: String(
      assumptions.contributionProfitPerConsultation,
    ),
    staffHoursSaved: String(assumptions.staffHoursSaved),
    staffHourlyCost: String(assumptions.staffHourlyCost),
    monthlyClinicImplementationCost: String(
      assumptions.monthlyClinicImplementationCost,
    ),
    monthlyPlatformOnboardingSupportCost: String(
      assumptions.monthlyPlatformOnboardingSupportCost,
    ),
  };
}

function toPricingAssumptions(
  planId: PricingAssumptions["planId"],
  raw: RawNumericAssumptions,
): PricingAssumptions {
  return {
    planId,
    additionalAttendedConsultations: Number(
      raw.additionalAttendedConsultations,
    ),
    contributionProfitPerConsultation: Number(
      raw.contributionProfitPerConsultation,
    ),
    staffHoursSaved: Number(raw.staffHoursSaved),
    staffHourlyCost: Number(raw.staffHourlyCost),
    monthlyClinicImplementationCost: Number(
      raw.monthlyClinicImplementationCost,
    ),
    monthlyPlatformOnboardingSupportCost: Number(
      raw.monthlyPlatformOnboardingSupportCost,
    ),
  };
}

function money(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function ratio(value: number | null): string {
  return value === null ? "No aplica" : `${value.toFixed(2)}×`;
}

export default function PricingCalculator() {
  const [planId, setPlanId] =
    useState<PricingAssumptions["planId"]>(defaultPricingAssumptions.planId);
  const [raw, setRaw] = useState<RawNumericAssumptions>(() =>
    toRawAssumptions(defaultPricingAssumptions),
  );
  const assumptions = useMemo(
    () => toPricingAssumptions(planId, raw),
    [planId, raw],
  );
  const validation = useMemo<PricingValidationErrors>(() => {
    const errors = validatePricingAssumptions(assumptions);

    for (const field of Object.keys(raw) as PricingNumericField[]) {
      if (raw[field].trim() === "") {
        errors[field] = "Ingresa un valor.";
      }
    }

    return errors;
  }, [assumptions, raw]);
  const isValid = Object.keys(validation).length === 0;
  const calculation = useMemo(
    () => (isValid ? calculatePricing(assumptions) : null),
    [assumptions, isValid],
  );
  const conservativeCalculation = useMemo(() => {
    const conservativeAssumptions = {
      ...assumptions,
      additionalAttendedConsultations: 0,
      contributionProfitPerConsultation: 0,
      staffHoursSaved: 0,
      staffHourlyCost: 0,
      monthlyPlatformOnboardingSupportCost: 0,
    };

    return Object.keys(
      validatePricingAssumptions(conservativeAssumptions),
    ).length === 0
      ? calculatePricing(conservativeAssumptions)
      : null;
  }, [assumptions]);
  function updateNumber(field: PricingNumericField, value: string) {
    setRaw((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="RutaSalud, inicio">
          <span className={styles.brandMark} aria-hidden="true">
            +
          </span>
          <span>RutaSalud</span>
        </Link>
        <nav className={styles.navigation} aria-label="Navegación principal">
          <Link href="/">Buscar doctores</Link>
          <Link href="/pricing" aria-current="page">
            Precios para clínicas
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="pricing-title">
          <p className={styles.eyebrow}>Herramientas para clínicas</p>
          <h1 id="pricing-title">¿Cuánto valor podría generar tu clínica?</h1>
          <p>
            Explora precios propuestos y ajusta tus supuestos para simular un
            escenario mensual.
          </p>
        </section>

        <aside className={styles.notice} aria-label="Aviso sobre la simulación">
          <strong>SIMULACIÓN · no son ahorros comprobados</strong>
          <span>
            Estos cálculos son hipotéticos. No garantizan resultados, ingresos,
            ahorros, citas ni aceptación de un precio.
          </span>
        </aside>

        <section aria-labelledby="plans-title">
          <div className={styles.sectionHeading}>
            <h2 id="plans-title">Planes propuestos</h2>
            <p>Precios hipotéticos en MXN al mes; no son precios de mercado validados.</p>
          </div>
          <div className={styles.planGrid}>
            {pricingPlans.map((plan) => (
              <label
                className={`${styles.planCard} ${planId === plan.id ? styles.planSelected : ""}`}
                key={plan.id}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={planId === plan.id}
                  onChange={() => setPlanId(plan.id)}
                />
                <span className={styles.planName}>{plan.name}</span>
                <strong className={styles.planPrice}>
                  {money(plan.priceMxn)}
                </strong>
                <span className={styles.planPeriod}>MXN / mes · hipótesis</span>
                <span className={styles.planDescription}>{plan.description}</span>
                {plan.id === "clinic-advanced" && (
                  <span className={styles.planWarning}>
                    Funciones avanzadas no disponibles ni verificadas
                  </span>
                )}
              </label>
            ))}
          </div>
          <p className={styles.freeAccess}>
            La búsqueda y comparación de doctores para pacientes permanece
            gratuita en todos los planes.
          </p>
        </section>

        <section className={styles.calculator} aria-labelledby="assumptions-title">
          <div className={styles.sectionHeading}>
            <h2 id="assumptions-title">Supuestos ajustables</h2>
            <p>
              Los resultados cambian inmediatamente. Ingresa cero cuando un
              supuesto no aplique.
            </p>
          </div>

          <div className={styles.inputGrid}>
            {numericFields.map((field) => {
              const rule = pricingInputRules[field.key];
              const error = validation[field.key];
              const hintId = `${field.key}-hint`;
              const errorId = `${field.key}-error`;

              return (
                <div className={styles.inputRow} key={field.key}>
                  <div className={styles.inputCopy}>
                    <label htmlFor={field.key}>{field.label}</label>
                    <span>{field.unit}</span>
                    <p id={hintId}>{field.hint}</p>
                  </div>
                  <div className={styles.inputControl}>
                    <input
                      id={field.key}
                      name={field.key}
                      type="number"
                      inputMode="decimal"
                      min={rule.min}
                      max={rule.max}
                      step={rule.step}
                      value={raw[field.key]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error ? `${hintId} ${errorId}` : hintId
                      }
                      onChange={(event) =>
                        updateNumber(field.key, event.target.value)
                      }
                    />
                    {error && (
                      <span className={styles.fieldError} id={errorId}>
                        {error}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className={styles.results}
          aria-labelledby="results-title"
          aria-live="polite"
        >
          <div className={styles.sectionHeading}>
            <h2 id="results-title">Resultado mensual estimado</h2>
            <p>Escenario hipotético, no ahorro ni retorno verificado.</p>
          </div>
          {calculation ? (
            <>
              <div className={styles.resultGrid}>
                <article className={styles.resultCard}>
                  <h3>Escenario estimado · tus supuestos</h3>
                  <p className={styles.scenarioDescription}>
                    Beneficios hipotéticos según las consultas y horas que
                    ingresaste.
                  </p>
                  <dl>
                    <div>
                      <dt>Contribución de consultas adicionales</dt>
                      <dd>{money(calculation.consultationContribution)}</dd>
                    </div>
                    <div>
                      <dt>Ahorro administrativo estimado</dt>
                      <dd>{money(calculation.administrativeSavings)}</dd>
                    </div>
                    <div>
                      <dt>Beneficio mensual estimado</dt>
                      <dd>{money(calculation.totalClinicBenefit)}</dd>
                    </div>
                    <div>
                      <dt>Suscripción propuesta</dt>
                      <dd>{money(calculation.subscriptionExpense)}</dd>
                    </div>
                    <div>
                      <dt>Implementación/soporte de la clínica</dt>
                      <dd>{money(calculation.clinicImplementationExpense)}</dd>
                    </div>
                    <div className={styles.resultEmphasis}>
                      <dt>Valor neto mensual estimado</dt>
                      <dd>{money(calculation.netClinicValue)}</dd>
                    </div>
                    <div>
                      <dt>Beneficio ÷ suscripción</dt>
                      <dd>{ratio(calculation.benefitToSubscriptionRatio)}</dd>
                    </div>
                    <div>
                      <dt>ROI neto sobre costos totales</dt>
                      <dd>
                        {calculation.netRoiPercent === null
                          ? "No aplica"
                          : `${calculation.netRoiPercent.toFixed(2)}%`}
                      </dd>
                    </div>
                  </dl>
                </article>
                <article className={`${styles.resultCard} ${styles.conservativeCard}`}>
                  <h3>Escenario conservador · sin beneficios demostrados</h3>
                  <p className={styles.scenarioDescription}>
                    Supone cero consultas adicionales y cero horas de ahorro
                    administrativo. No es una predicción ni un resultado
                    verificado.
                  </p>
                  {conservativeCalculation ? (
                    <dl>
                      <div>
                        <dt>Beneficio considerado</dt>
                        <dd>{money(conservativeCalculation.totalClinicBenefit)}</dd>
                      </div>
                      <div>
                        <dt>Suscripción propuesta</dt>
                        <dd>{money(conservativeCalculation.subscriptionExpense)}</dd>
                      </div>
                      <div>
                        <dt>Implementación/soporte de la clínica</dt>
                        <dd>
                          {money(conservativeCalculation.clinicImplementationExpense)}
                        </dd>
                      </div>
                      <div className={styles.resultEmphasis}>
                        <dt>Resultado neto mensual conservador</dt>
                        <dd>{money(conservativeCalculation.netClinicValue)}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className={styles.invalidNotice}>
                      Corrige los costos para calcular este escenario.
                    </p>
                  )}
                  <p className={styles.conservativeFormula}>
                    $0 de beneficios − suscripción − costos mensuales de la
                    clínica.
                  </p>
                </article>
                <article className={styles.platformCard}>
                  <h3>Economía estimada de RutaSalud</h3>
                  <p>
                    Contribución mensual por suscriptor = suscripción propuesta
                    − onboarding y soporte estimados de RutaSalud.
                  </p>
                  <strong>{money(calculation.platformMonthlyContribution)}</strong>
                  <span>
                    Ingreso hipotético de suscripción menos costo mensual
                    supuesto; no es ingreso real ni validado.
                  </span>
                </article>
              </div>
              <details className={styles.formulas}>
                <summary>Ver fórmulas, supuestos y límites</summary>
                <ul>
                  <li>
                    Consultas adicionales × ganancia de contribución por
                    consulta = contribución de consultas.
                  </li>
                  <li>
                    Horas ahorradas × costo por hora = ahorro administrativo
                    estimado.
                  </li>
                  <li>
                    Beneficio estimado = contribución de consultas + ahorro
                    administrativo.
                  </li>
                  <li>
                    Valor neto = beneficio estimado − suscripción − costo
                    mensual de implementación/soporte de la clínica.
                  </li>
                  <li>
                    Beneficio/suscripción = beneficio estimado ÷ suscripción.
                    Para Basic ($0), la relación no aplica.
                  </li>
                  <li>
                    ROI neto = valor neto ÷ costos totales de la clínica
                    (suscripción + implementación/soporte) × 100. Si los costos
                    totales son $0, no aplica.
                  </li>
                  <li>
                    Contribución RutaSalud = suscripción − onboarding/soporte
                    mensual estimado de RutaSalud. Se calcula por separado.
                  </li>
                </ul>
                <p>
                  Los supuestos los proporciona quien usa la calculadora. Una
                  consulta debe ser adicional y atendida; no se estima el precio
                  cobrado ni se garantiza que ocurra. El costo de RutaSalud es
                  una asignación mensual estimada, incluso si onboarding ocurre
                  una sola vez. Pagar no altera verificación, credibilidad
                  médica ni ranking de coincidencia.
                </p>
              </details>
            </>
          ) : (
            <p className={styles.invalidNotice} role="status">
              Corrige los campos marcados para calcular. No se muestran
              resultados con supuestos inválidos.
            </p>
          )}
        </section>

        <PricingScenarios
          assumptions={assumptions}
          canSave={isValid}
          onLoad={(loaded) => {
            setPlanId(loaded.planId);
            setRaw(toRawAssumptions(loaded));
          }}
        />
      </main>

      <footer className={styles.footer}>
        <span>RutaSalud · Proyecto de demostración</span>
        <span>
          La búsqueda para pacientes es gratuita. Pagar no mejora la verificación
          ni la posición en resultados; las citas solo se confirman con evidencia
          de aceptación de la clínica.
        </span>
        <Link href="/">Volver a buscar doctores</Link>
      </footer>
    </div>
  );
}
