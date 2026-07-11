import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CVForge AI — Build CVs that get hired", template: "%s | CVForge AI" },
  description: "Plataforma con IA para crear CVs ATS-optimizados, analizar compatibilidad y generar tu portafolio web. 100% gratis con Ollama.",
  keywords: ["CV", "resume", "ATS", "IA", "Ollama", "portafolio", "gratis"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "CVForge AI",
    description: "Construye CVs que realmente consiguen trabajo. IA local, 100% gratis.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: "hsl(240 10% 8%)", border: "1px solid hsl(240 8% 16%)", color: "hsl(240 5% 92%)" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
