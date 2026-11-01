import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RutaSalud | Compara opciones de atención",
  description:
    "Compara perfiles de demostración según tus preferencias. Tú decides qué hacer después.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
