import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./launch.module.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rutasalud-w12.vercel.app"),
  title: "RutaSalud | Compara opciones con claridad",
  description:
    "Para pacientes y personas cuidadoras en Ciudad de México: compara perfiles de demostración, entiende qué información es incierta y decide tu siguiente paso.",
  alternates: {
    canonical: "https://rutasalud-w12.vercel.app/launch",
  },
  openGraph: {
    title: "RutaSalud | Compara opciones con claridad",
    description:
      "Compara perfiles de demostración y revisa qué información está simulada, pendiente o no disponible.",
    url: "https://rutasalud-w12.vercel.app/launch",
    siteName: "RutaSalud",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RutaSalud | Compara opciones con claridad",
    description:
      "Compara perfiles de demostración y revisa qué información está simulada, pendiente o no disponible.",
  },
};

const campaignAssets = [
  {
    series: "Qué significa la coincidencia",
    title: "Coincidir con tus filtros no demuestra calidad clínica.",
    description:
      "Ejemplo ficticio: revisa cómo presupuesto, distancia y horario pueden coincidir sin decir nada sobre calidad clínica.",
    preview: "/campaign/week15/coincidencia-cuadrada.svg",
    previewAlt:
      "Gráfico de demostración: un perfil ficticio coincide con filtros de ejemplo; no es una recomendación médica.",
    downloads: [
      {
        href: "/campaign/week15/coincidencia-cuadrada.svg",
        label: "Descargar gráfico cuadrado",
      },
    ],
  },
  {
    series: "Qué está confirmado",
    title: "Una cifra visible no siempre está confirmada.",
    description:
      "Carrusel de cuatro láminas sobre simulación, fuente, fecha y datos inciertos; ninguna cifra representa una clínica real.",
    preview: "/campaign/week15/evidencia-lamina-1.svg",
    previewAlt:
      "Portada del carrusel de demostración sobre estados de evidencia en precios de consulta.",
    downloads: [
      {
        href: "/campaign/week15/evidencia-lamina-1.svg",
        label: "Descargar carrusel · lámina 1",
      },
      {
        href: "/campaign/week15/evidencia-lamina-2.svg",
        label: "Descargar carrusel · lámina 2",
      },
      {
        href: "/campaign/week15/evidencia-lamina-3.svg",
        label: "Descargar carrusel · lámina 3",
      },
      {
        href: "/campaign/week15/evidencia-lamina-4.svg",
        label: "Descargar carrusel · lámina 4",
      },
    ],
  },
  {
    series: "Después, tú decides",
    title: "Una alternativa también puede darte un siguiente paso.",
    description:
      "Lista de revisión para comparar los datos disponibles y confirmar directamente lo que siga incierto.",
    preview: "/campaign/week15/siguiente-paso-vertical.svg",
    previewAlt:
      "Gráfico de demostración con una lista para revisar opciones y confirmar información faltante.",
    downloads: [
      {
        href: "/campaign/week15/siguiente-paso-vertical.svg",
        label: "Descargar lista vertical",
      },
    ],
  },
];

export default function LaunchPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#contenido">
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="RutaSalud, comparar opciones">
          <span className={styles.brandMark} aria-hidden="true">
            +
          </span>
          <span>RutaSalud</span>
        </Link>
        <nav className={styles.navigation} aria-label="Navegación de RutaSalud">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#piezas">Guías para compartir</a>
        </nav>
      </header>

      <main id="contenido">
        <section className={styles.hero} aria-labelledby="launch-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              Para pacientes y personas cuidadoras en Ciudad de México
            </p>
            <h1 id="launch-title">
              Compara opciones. Entiende la información. Tú decides qué sigue.
            </h1>
            <p className={styles.lead}>
              RutaSalud te ayuda a comparar perfiles de demostración según tus
              preferencias y a distinguir lo simulado, lo incierto y lo que no
              está disponible.
            </p>
            <p className={styles.freeNote}>
              La comparación para pacientes es gratuita. No necesitas compartir
              información médica.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/#preferences-title">
                Comparar perfiles de demostración
              </Link>
              <a className={styles.secondaryAction} href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
          </div>
          <aside className={styles.heroNote} aria-label="Aviso sobre la demostración">
            <span className={styles.noticeLabel}>Demostración</span>
            <h2>Los perfiles y ejemplos no son datos de clínicas reales.</h2>
            <p>
              Nombres, precios, distancias y horarios mostrados para probar la
              comparación son ficticios o simulados. No están verificados y no
              confirman disponibilidad ni una cita.
            </p>
          </aside>
        </section>

        <section
          className={styles.section}
          id="como-funciona"
          aria-labelledby="how-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Información clara, sin promesas de más</p>
            <h2 id="how-title">Compara criterios; conserva la decisión.</h2>
          </div>
          <div className={styles.explanationGrid}>
            <article className={styles.explanationCard}>
              <span className={`${styles.status} ${styles.match}`}>Coincide</span>
              <h3>Qué significa una coincidencia</h3>
              <p>
                El perfil cumple los filtros elegidos en el ejemplo. Eso no
                verifica credenciales, calidad médica ni si es adecuado para ti.
              </p>
              <div className={styles.exampleBox}>
                <strong>Ejemplo ficticio</strong>
                <span>Presupuesto: hasta $1,000 MXN</span>
                <span>Perfil de muestra: $950 MXN · 4 km · tarde</span>
                <span>Resultado: coincide con esos filtros simulados.</span>
              </div>
            </article>
            <article className={styles.explanationCard}>
              <span className={`${styles.status} ${styles.uncertain}`}>
                No confirmado
              </span>
              <h3>Qué significa una cifra</h3>
              <p>
                Un precio solo puede describirse como confirmado cuando existe
                evidencia trazable de la clínica, con fuente y fecha. En esta
                demostración, las cifras son simuladas y no están confirmadas.
              </p>
              <div className={styles.exampleBox}>
                <strong>Si falta evidencia</strong>
                <span>La cifra se marca como pendiente, incierta o no disponible.</span>
                <span>Pregunta directamente antes de tomar una decisión.</span>
              </div>
            </article>
            <article className={styles.explanationCard}>
              <span className={`${styles.status} ${styles.nextStep}`}>
                Siguiente paso
              </span>
              <h3>Qué puedes hacer después</h3>
              <p>
                Revisa qué criterio coincide, cuál no y cuál es desconocido.
                Puedes cambiar tus filtros o revisar una alternativa.
              </p>
              <div className={styles.exampleBox}>
                <strong>La decisión es tuya</strong>
                <span>Confirma directamente cualquier dato que necesites.</span>
                <span>La herramienta no envía solicitudes ni reserva citas.</span>
              </div>
            </article>
          </div>
        </section>

        <section
          className={styles.voiceSection}
          aria-labelledby="voice-title"
        >
          <div>
            <p className={styles.eyebrow}>Cómo hablamos</p>
            <h2 id="voice-title">Tres reglas de voz RutaSalud</h2>
          </div>
          <ol className={styles.voiceRules}>
            <li>
              <strong>Claridad, no lenguaje clínico.</strong>
              <span>Explicamos coincidencias y próximos pasos con palabras sencillas.</span>
            </li>
            <li>
              <strong>Honestidad sobre la evidencia.</strong>
              <span>Nombramos lo simulado, lo pendiente y lo que no sabemos.</span>
            </li>
            <li>
              <strong>Calma y decisión de la persona.</strong>
              <span>Mostramos opciones sin presionar ni elegir por ti.</span>
            </li>
          </ol>
        </section>

        <section
          className={styles.campaignSection}
          id="piezas"
          aria-labelledby="campaign-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Piezas de demostración</p>
            <h2 id="campaign-title">Guías listas para compartir</h2>
            <p>
              Cada gráfico usa ejemplos ficticios. Están preparados para
              compartirse; esto no significa que se hayan distribuido ni que se
              haya probado su recepción con una audiencia.
            </p>
          </div>
          <div className={styles.campaignGrid}>
            {campaignAssets.map((asset, index) => (
              <article className={styles.campaignCard} key={asset.series}>
                <div className={styles.previewFrame}>
                  <Image
                    src={asset.preview}
                    alt={asset.previewAlt}
                    width={index === 2 ? 540 : 540}
                    height={index === 2 ? 960 : 540}
                    unoptimized
                  />
                </div>
                <div className={styles.campaignCopy}>
                  <p className={styles.series}>{asset.series}</p>
                  <h3>{asset.title}</h3>
                  <p>{asset.description}</p>
                  <ul className={styles.downloadList}>
                    {asset.downloads.map((download) => (
                      <li key={download.href}>
                        <a href={download.href} download>
                          {download.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="next-title">
          <div>
            <p className={styles.eyebrow}>Sin registro ni formulario</p>
            <h2 id="next-title">Prueba la comparación con perfiles de muestra.</h2>
            <p>
              No ingreses información médica. Los perfiles son simulados; no
              hay contacto con clínicas ni confirmación de citas.
            </p>
          </div>
          <Link className={styles.primaryAction} href="/#preferences-title">
            Ir a comparar opciones
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/">RutaSalud · Comparación de demostración</Link>
        <span>
          No ofrece diagnósticos, no verifica calidad médica ni reserva citas.
        </span>
      </footer>
    </div>
  );
}
