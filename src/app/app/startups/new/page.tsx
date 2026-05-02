import { NewStartupForm } from "@/components/new-startup-form";
import { readGameformSnapshot } from "@/lib/gameform-store";

export default async function NewStartupPage() {
  const snapshot = await readGameformSnapshot();

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <h1 className="font-display text-3xl font-bold text-slate-950">
          Cadastro de startup
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Atualize dados institucionais, mentor responsavel e cohort em um fluxo
          persistido no servidor.
        </p>
      </section>

      <NewStartupForm startup={snapshot.startup} />
    </main>
  );
}
