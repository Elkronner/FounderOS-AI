"use client";

import { jsPDF } from "jspdf";

import type {
  ActivityLog,
  CommentThread,
  ModuleDefinition,
  StudioSummary,
} from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export function ReportExportButton({
  summary,
  modules,
  activityLogs,
  comments,
}: {
  summary: StudioSummary;
  modules: ModuleDefinition[];
  activityLogs: ActivityLog[];
  comments: CommentThread[];
}) {
  const exportPdf = () => {
    const doc = new jsPDF();
    let y = 20;

    const writeLine = (text: string, x = 14) => {
      const lines = doc.splitTextToSize(text, 178);
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, x, y);
        y += 6;
      });
    };

    doc.setFontSize(18);
    writeLine("FounderOS AI - Relatório Executivo");
    y += 2;
    doc.setFontSize(12);
    writeLine(`Studio: ${summary.name}`);
    writeLine(`Saude geral: ${formatPercent(summary.health)}`);
    writeLine(`Pendencias prioritarias: ${summary.pendingAlerts}`);
    writeLine(`Mentor responsavel: ${summary.mentorName}`);
    writeLine(`Proxima reuniao: ${summary.nextMeeting}`);

    y += 4;
    writeLine("Resumo dos modulos da fase 3:");
    modules.forEach((module) => {
      writeLine(
        `- ${module.title}: ${module.progress}% preenchido | maturidade ${module.maturity}%`,
        18,
      );
    });

    y += 4;
    writeLine("Historico recente:");
    activityLogs.slice(0, 6).forEach((entry) => {
      writeLine(`- ${entry.actor} ${entry.action.toLowerCase()} ${entry.target}`, 18);
    });

    y += 4;
    writeLine("Comentarios recentes:");
    comments.slice(0, 6).forEach((entry) => {
      writeLine(`- ${entry.author}: ${entry.message}`, 18);
    });

    doc.save("founderos-ai-relatorio.pdf");
  };

  return (
    <button
      type="button"
      onClick={exportPdf}
      className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
    >
      Exportar PDF
    </button>
  );
}
