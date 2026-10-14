"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const attempted = useRef(false);
  const [status, setStatus] = useState("Verificando tu dirección de correo...");
  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    if (!token) { setStatus("El enlace de verificación no es válido."); return; }
    api.verifyEmail(token)
      .then(() => setStatus("Correo verificado correctamente. Ya puedes iniciar sesión."))
      .catch(() => setStatus("El enlace expiró o ya se utilizó. Solicita uno nuevo."));
  }, [token]);
  return <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
    <h1 className="text-2xl font-bold text-white mb-4">ePersona</h1>
    <p className="text-slate-300" role="status">{status}</p>
    <Link href="/login" className="mt-6 inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">Iniciar sesión</Link>
  </div>;
}

export default function VerifyPage() {
  return <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
    <Suspense fallback={<p className="text-white">Cargando...</p>}><VerifyContent /></Suspense>
  </main>;
}
