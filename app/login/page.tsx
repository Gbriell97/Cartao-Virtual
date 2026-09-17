"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0b1220] p-4"><form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111a29] p-6 shadow-xl"><h1 className="text-2xl font-bold text-white">Entrar</h1><p className="mt-1 text-sm text-white/60">Acesse o painel do seu cartão.</p><div className="mt-6"><label className="text-sm text-white/80">E-mail</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" placeholder="seu@email.com" required /></div><div className="mt-4"><label className="text-sm text-white/80">Senha</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" placeholder="Sua senha" required /></div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-white px-4 py-3 font-medium text-black disabled:opacity-50">{loading ? "Entrando..." : "Entrar"}</button></form></main>;
}