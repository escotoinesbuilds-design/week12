import Link from "next/link";
import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Nuestra defensa | RutaSalud",
  description:
    "Necesidad, producto, feedback, hipótesis comerciales y próximos pasos de RutaSalud.",
};

const comparisonCriteria = [
  "Presupuesto",
  "Distancia",
  "Especialidad",
  "Horario",
  "Preferencia de profesional",
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#contenido">
        Saltar al contenido
      </a>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="RutaSalud, comparar opciones">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>RutaSalud</span>
        </Link>
        <nav className="site-navigation" aria-label="Navegación principal">
          <Link href="/">Comparar opciones</Link>
          <Link href="/launch">Conoce RutaSalud</Link>
          <Link href="/pricing">Precios para clínicas</Link>
        </nav>
      </header>

      <main className={styles.main} id="contenido">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Defensa de producto · Semana 16</p>
          <h1>Confianza antes que promesas</h1>
          <p className={styles.lead}>
            Qué problema abordamos, qué hace la demostración, qué evidencia
            tenemos y qué debemos validar antes de crecer.
          </p>
        </div>

        <div className={styles.deck}>
          <section className={styles.slide} aria-labelledby="need-title">
            <div className={styles.slideHeader}>
              <span className={styles.number} aria-hidden="true">
                01
              </span>
              <div>
                <p className={styles.slideLabel}>Necesidad · hipótesis</p>
                <h2 className={styles.slideTitle} id="need-title">
                  Encontrar una opción adecuada requiere información clara.
                </h2>
              </div>
            </div>
            <p className={styles.bodyCopy}>
              Para pacientes en México puede ser difícil comparar médicos por
              presupuesto, distancia, especialidad y horario cuando el precio o
              la disponibilidad no son confiables o están incompletos. RutaSalud
              busca hacer visibles las coincidencias y lo que aún falta
              confirmar; no afirma que esta necesidad esté medida en toda la
              población mexicana.
            </p>
            <div className={styles.note}>
              <strong>Señal de feedback previo:</strong> personas reportaron
              confusión sobre por qué seguían visibles opciones que no cumplían
              todos sus filtros y qué hacer cuando no había coincidencia
              completa.
            </div>
          </section>

          <section className={styles.slide} aria-labelledby="product-title">
            <div className={styles.slideHeader}>
              <span className={styles.number} aria-hidden="true">
                02
              </span>
              <div>
                <p className={styles.slideLabel}>Producto</p>
                <h2 className={styles.slideTitle} id="product-title">
                  Comparamos preferencias, no calidad clínica.
                </h2>
              </div>
            </div>
            <ul className={styles.criteria} aria-label="Criterios comparados">
              {comparisonCriteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span className={`${styles.statusTag} ${styles.match}`}>
                  Coincidencia
                </span>
                <p>Cumple todos los filtros seleccionados.</p>
              </div>
              <div className={styles.statusCard}>
                <span className={`${styles.statusTag} ${styles.alternative}`}>
                  Alternativa
                </span>
                <p>Explica qué criterio no coincide o es desconocido.</p>
              </div>
            </div>
            <p className={styles.caveat}>
              Los perfiles de demostración son ficticios o simulados. No
              verificamos credenciales, precios ni disponibilidad en tiempo
              real, y no reservamos citas.
            </p>
          </section>

          <section className={styles.slide} aria-labelledby="users-title">
            <div className={styles.slideHeader}>
              <span className={styles.number} aria-hidden="true">
                03
              </span>
              <div>
                <p className={styles.slideLabel}>Usuarios · evidencia separada</p>
                <h2 className={styles.slideTitle} id="users-title">
                  Feedback de personas y pruebas mecánicas no son lo mismo.
                </h2>
              </div>
            </div>
            <div className={styles.evidenceGrid}>
              <article className={styles.evidenceCard}>
                <p className={styles.evidenceLabel}>Feedback de personas</p>
                <h3>Seis personas reportadas</h3>
                <p>
                  En feedback previo se mencionó confusión sobre alternativas,
                  qué hacer sin una coincidencia total y cómo continuar hacia
                  una cita. Una persona que regresó pidió filtrar por
                  especialidad.
                </p>
                <p className={styles.evidenceLimit}>
                  Reportes suministrados por el equipo; faltan fechas y notas
                  observacionales completas. No demuestran mejoras ni
                  prevalencia.
                </p>
                <p>
                  En Semana 15, cinco participantes reportaron completar la
                  tarea y reconocer la simulación; son autorreportes, no
                  observación independiente.
                </p>
              </article>
              <article className={styles.evidenceCard}>
                <p className={styles.evidenceLabel}>Semana 16 · prueba mecánica</p>
                <h3>Resultado sintético: 1 + 3</h3>
                <p>
                  En una prueba local de producción (390 × 844), preferencias
                  sintéticas de $1,000 MXN, 5 km, tarde y mujer dieron una
                  coincidencia completa y tres alternativas; cuatro perfiles
                  quedaron etiquetados como ficticios.
                </p>
                <p>
                  A 320 y 390 px no hubo overflow horizontal y se pudo llegar al
                  botón y los resultados. <code>npm test</code>: 36/36; build
                  de producción: pasó.
                </p>
                <p className={styles.evidenceLimit}>
                  Es una comprobación de software con datos sintéticos, no una
                  prueba con pacientes.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.slide} aria-labelledby="price-title">
            <div className={styles.slideHeader}>
              <span className={styles.number} aria-hidden="true">
                04
              </span>
              <div>
                <p className={styles.slideLabel}>Precio · hipótesis no validadas</p>
                <h2 className={styles.slideTitle} id="price-title">
                  Acceso gratuito para pacientes; valor por validar con clínicas.
                </h2>
              </div>
            </div>
            <div className={styles.priceGrid}>
              <div className={styles.priceCard}>
                <p>Pacientes</p>
                <strong>Gratis</strong>
                <span>Acceso a la comparación</span>
              </div>
              <div className={styles.priceCard}>
                <p>Suscripción propuesta</p>
                <strong>$699</strong>
                <span>MXN por mes</span>
              </div>
              <div className={styles.priceCard}>
                <p>Suscripción propuesta</p>
                <strong>$1,299</strong>
                <span>MXN por mes</span>
              </div>
            </div>
            <div className={styles.note}>
              <strong>Prueba gratuita propuesta: un mes.</strong> Precios,
              prueba, conversión e ingresos son hipótesis comerciales; no son
              ventas ni disposición de pago validadas. El principal riesgo es
              que la clínica no perciba valor recurrente suficiente.
            </div>
          </section>

          <section className={styles.slide} aria-labelledby="next-title">
            <div className={styles.slideHeader}>
              <span className={styles.number} aria-hidden="true">
                05
              </span>
              <div>
                <p className={styles.slideLabel}>Siguiente paso</p>
                <h2 className={styles.slideTitle} id="next-title">
                  Validar valor recurrente sin erosionar la confianza.
                </h2>
              </div>
            </div>
            <p className={styles.bodyCopy}>
              Antes de escalar, validar quién paga, qué trabajo recurrente
              resuelve cada plan, los costos de soporte e incorporación y si el
              valor se mantiene después de la prueba gratuita. La fiabilidad de
              la información y la privacidad del paciente siguen siendo
              condiciones, no variables de precio.
            </p>
            <div className={styles.privacyRisk}>
              <strong>Riesgo de privacidad pendiente</strong>
              <p>
                <code>/pricing</code> guarda nombres de escenarios y supuestos
                hipotéticos en <code>localStorage</code> del navegador, sin
                aislamiento por cuenta. La interfaz advierte no incluir datos
                personales, de pacientes ni clínicos. No guardes información
                identificable allí. La revisión de código/RLS no valida por
                completo la seguridad de producción.
              </p>
            </div>
            <p className={styles.shadowClause}>
              Cláusula sombra: la presión financiera nunca justifica favorecer
              en rankings a clínicas que pagan, presentar información no
              verificada como confirmada ni comprometer la privacidad del
              paciente.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
