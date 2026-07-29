import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CVForge AI", template: "%s | CVForge AI" },
  description: "Crea CVs ATS-optimizados con IA local. 100% gratis.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
            <Toaster position="bottom-right" theme="dark"
              toastOptions={{ style: { background:"hsl(240 10% 8%)", border:"1px solid hsl(240 8% 16%)", color:"hsl(240 5% 92%)" } }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
