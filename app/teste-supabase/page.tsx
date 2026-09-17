import { supabase } from "@/lib/supabase";

export default async function TesteSupabase() {
  const { data, error } = await supabase
    .from("digital_cards")
    .select("id, slug")
    .limit(5);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="mb-4 text-2xl font-bold">Teste Supabase</h1>

      {error ? (
        <pre className="text-red-400">{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <pre className="text-green-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}