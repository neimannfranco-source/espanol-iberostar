import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Español Iberostar",
  description: "Plataforma de español para colaboradores Iberostar & Grand Amazon",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#090f0e" }}>{children}</body>
    </html>
  );
}
