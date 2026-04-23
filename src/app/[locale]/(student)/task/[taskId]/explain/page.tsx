"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function TaskExplainPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState("");
  const t = useTranslations("taskExplain");
  const locale = useLocale();

  useEffect(() => {
    async function fetchExplanation() {
      const res = await fetch("/api/projects");
      const projects = await res.json();
      let task = null;
      for (const p of projects) {
        for (const phase of p.phases) {
          const found = phase.tasks.find((t: { id: string }) => t.id === taskId);
          if (found) {
            task = { ...found, phaseName: phase.name, topicName: p.topic?.name || p.title };
            break;
          }
        }
      }

      if (!task) {
        setExplanation(t("notFound"));
        setLoading(false);
        return;
      }

      setTaskTitle(task.title);

      if (task.explanation) {
        setExplanation(task.explanation);
        setLoading(false);
        return;
      }

      try {
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-locale": locale },
          body: JSON.stringify({
            strategyCode: "AI-S12",
            input: `Task: ${task.title}\nDescription: ${task.description || "N/A"}\nPhase: ${task.phaseName}\nTopic: ${task.topicName}`,
          }),
        });
        const data = await genRes.json();
        setExplanation(data.result);
      } catch {
        setExplanation(
          `# ${task.title}\n\n## Task Overview\n${task.description || "Complete the tasks required for this phase."}\n\n## Steps\n1. Read the task requirements carefully\n2. Research relevant materials\n3. Complete the work\n4. Review and submit\n\n> 💡 Full AI explanations require a GEMINI_API_KEY to be configured.`
        );
      }
      setLoading(false);
    }
    fetchExplanation();
  }, [taskId, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4" />
        <p className="text-text-dim">{t("generating")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-text-dim hover:text-accent text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("back")}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center text-lg">📖</div>
        <div>
          <h1 className="text-2xl font-bold text-text">{t("title")}</h1>
          <p className="text-text-dim text-sm">{taskTitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8">
        <div
          className="prose prose-sm max-w-none
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-text
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-accent
            [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-text
            [&_p]:text-text-dim [&_p]:mb-3 [&_p]:leading-relaxed
            [&_li]:text-text-dim [&_li]:mb-1
            [&_blockquote]:border-l-3 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4 [&_blockquote]:text-text-dim [&_blockquote]:bg-accent/5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl
            [&_code]:bg-surface2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-accent [&_code]:text-xs
          "
          style={{ whiteSpace: "pre-wrap" }}
        >
          {explanation}
        </div>
      </div>
    </div>
  );
}
