"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Project {
  id: string;
  title: string;
  status: string;
  topic: { name: string } | null;
  createdAt: string;
  phases: { tasks: { status: string }[] }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("profile");
  const locale = useLocale();

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    topic_selection: { label: t("statusTopicSelection"), color: "text-purple", bg: "bg-purple/10" },
    planning: { label: t("statusPlanning"), color: "text-cyan", bg: "bg-cyan/10" },
    executing: { label: t("statusExecuting"), color: "text-green", bg: "bg-green/10" },
    adjusting: { label: t("statusAdjusting"), color: "text-amber", bg: "bg-amber/10" },
    completed: { label: t("statusCompleted"), color: "text-green", bg: "bg-green/10" },
    archived: { label: t("statusArchived"), color: "text-text-muted", bg: "bg-surface2" },
  };

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-border p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-purple/10 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">{t("demoName")}</h1>
            <p className="text-sm text-text-dim">demo@researchflow.com</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="stat-card p-3 rounded-xl">
            <p className="text-2xl font-bold text-accent">{projects.length}</p>
            <p className="text-xs text-text-muted">{t("statProjects")}</p>
          </div>
          <div className="stat-card p-3 rounded-xl">
            <p className="text-2xl font-bold text-green">
              {projects.reduce((sum, p) => sum + p.phases.reduce((s, ph) => s + ph.tasks.filter(tk => tk.status === "completed" || tk.status === "graded").length, 0), 0)}
            </p>
            <p className="text-xs text-text-muted">{t("statTasks")}</p>
          </div>
          <div className="stat-card p-3 rounded-xl">
            <p className="text-2xl font-bold text-purple">
              {projects.filter(p => p.status === "completed").length}
            </p>
            <p className="text-xs text-text-muted">{t("statCompleted")}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4 text-text">{t("projectsTitle")}</h2>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-text-dim mb-4">{t("empty")}</p>
          <button
            onClick={() => router.push(`/${locale}/welcome`)}
            className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
          >
            {t("startNew")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const status = statusConfig[project.status] || statusConfig.executing;
            const totalTasks = project.phases.reduce((sum, p) => sum + p.tasks.length, 0);
            const completedTasks = project.phases.reduce(
              (sum, p) =>
                sum + p.tasks.filter((tk) => tk.status === "completed" || tk.status === "graded").length,
              0
            );
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return (
              <button
                key={project.id}
                onClick={() => router.push(`/${locale}/map?projectId=${project.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-border p-5 hover:border-accent hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text">{project.topic?.name || project.title}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{new Date(project.createdAt).toLocaleDateString(locale)}</span>
                  <span>{t("taskProgress", { done: completedTasks, total: totalTasks })}</span>
                  <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="font-medium text-accent">{progress}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => router.push(`/${locale}/welcome`)}
        className="w-full mt-6 py-3.5 border-2 border-dashed border-border hover:border-accent hover:text-accent text-text-dim font-semibold rounded-2xl transition-colors"
      >
        {t("newProject")}
      </button>
    </div>
  );
}
