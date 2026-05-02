import Link from "next/link";

import { SensorComparisonChart } from "@/components/charts/sensor-comparison-chart";
import { readGameformSnapshot } from "@/lib/gameform-store";

export default async function GfSensorPage() {
  const snapshot = await readGameformSnapshot();
  const totalInitial = snapshot.sensorComparison.reduce((total, item) => total + item.initial, 0);
  const totalCurrent = snapshot.sensorComparison.reduce((total, item) => total + item.current, 0);

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-950">Comparativo GF-Sensor</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Comparação direta entre o diagnóstico de entrada e o estágio atual de maturidade
              por frente do negócio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/modules/gf-sensor-initial"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Editar inicial
            </Link>
            <Link
              href="/app/modules/gf-sensor-current"
              className="rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Editar atual
            </Link>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Radar de força do empreendimento</h2>
            <p className="mt-1 text-sm text-slate-600">
              Quanto mais aberta a área azul, mais forte está a empresa na leitura atual.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Inicial:</span> {totalInitial}{" "}
            | <span className="font-semibold text-slate-900">Atual:</span> {totalCurrent}
          </div>
        </div>
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Preenchimento: startup | Revisão: mentor</p>
          <p className="mt-1 text-xs text-blue-800">
            Esta tela é somente leitura. Para alterar respostas, use &quot;Editar inicial&quot; ou &quot;Editar atual&quot;.
          </p>
        </div>
        <SensorComparisonChart data={snapshot.sensorComparison} />
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Análise por pergunta</h2>
            <p className="mt-1 text-sm text-slate-600">
              Conferência linha a linha dos 16 itens do workbook.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Total inicial:</span> {totalInitial}{" "}
            | <span className="font-semibold text-slate-900">Total atual:</span> {totalCurrent}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Pergunta</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Inicial</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Atual</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Delta</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.sensorComparison.map((item) => {
                const delta = item.current - item.initial;
                return (
                  <tr key={item.dimension} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.dimension}</td>
                    <td className="px-4 py-3 text-slate-700">{item.initial}</td>
                    <td className="px-4 py-3 text-slate-700">{item.current}</td>
                    <td className="px-4 py-3 text-slate-700">{delta > 0 ? `+${delta}` : delta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
