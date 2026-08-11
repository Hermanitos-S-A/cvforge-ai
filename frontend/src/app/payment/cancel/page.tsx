"use client";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

const REASONS = [
  { icon:"💰", title:"El precio no es el adecuado", desc:"Entendemos. El plan Free siempre estará disponible sin límite de tiempo." },
  { icon:"❓", title:"Tengo dudas sobre el producto", desc:"Escríbenos y te ayudamos antes de que decidas." },
  { icon:"🔄", title:"Quiero probar más antes", desc:"Sigue usando el plan Free, puedes actualizar cuando quieras." },
];

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          transition={{ type:"spring", stiffness:180 }}>

          {/* Icon */}
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ type:"spring", delay:0.1, stiffness:200 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-secondary border border-border">
            <XCircle size={36} className="text-muted-foreground" />
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Pago cancelado
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              No se realizó ningún cargo. Puedes seguir usando el plan Free o intentar de nuevo cuando quieras.
            </p>

            {/* Reasons */}
            <div className="space-y-3 mb-8 text-left">
              {REASONS.map(r => (
                <div key={r.title} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <span className="text-xl flex-shrink-0">{r.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/upgrade"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                Intentar de nuevo
              </Link>
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
                <ArrowLeft size={14} /> Volver al dashboard
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              ¿Tienes dudas?{" "}
              <a href="mailto:soporte@cvforge.ai" className="text-primary hover:underline">
                Contáctanos →
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
