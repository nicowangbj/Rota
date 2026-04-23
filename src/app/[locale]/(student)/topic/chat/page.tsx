"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import ChatWindow from "@/components/ChatWindow";
import RotaAvatar from "@/components/RotaAvatar";

export default function TopicChatPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("topicChat");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleGenerateProfile = async () => {
    if (!conversationId) return;
    router.push(`/${locale}/topic/profile?conversationId=${conversationId}`);
  };

  const handleQuickStart = () => {
    router.push(`/${locale}/topic/profile?quickStart=1`);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Left: AI tutor character + whiteboard area */}
      <div className="hidden lg:flex flex-col w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-border p-6 text-center mb-4 rota-panel">
          <div className="flex justify-center mb-3">
            <RotaAvatar size="xs" className="mx-auto" />
          </div>
          <h3 className="font-bold text-text">{t("tutorTitle")}</h3>
          <p className="text-xs text-text-muted mt-1">{t("tutorStatus")}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-border p-5 overflow-hidden rota-panel">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t("dialogNotes")}</h4>
          <div className="img-placeholder" style={{ width: "100%", height: 200 }}>
            <span className="spec">白板区域 · 实时记录对话关键信息 · 待设计</span>
          </div>
        </div>
      </div>

      {/* Right: Chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/8 text-accent text-xs font-semibold mb-3">
            {t("step", { current: 1, total: 4 })}
          </div>
          <h1 className="text-xl font-bold text-text">{t("title")}</h1>
          <p className="text-sm text-text-dim">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-border p-5">
          <ChatWindow
            strategyCode="AI-S01"
            placeholder={t("placeholder")}
            initialMessages={[
              {
                role: "assistant",
                content: t("initialMessage"),
              },
            ]}
            onConversationUpdate={(id) => setConversationId(id)}
          />
        </div>

        <div className="pt-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateProfile}
              disabled={!conversationId}
              className="flex-1 py-3.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-lg shadow-accent/20"
            >
              {t("generateProfile")}
            </button>
            <button
              onClick={handleQuickStart}
              className="sm:w-auto px-6 py-3.5 border border-border hover:border-accent hover:text-accent text-text-dim font-semibold rounded-xl transition-colors"
            >
              {t("useDefault")}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-3">
            {t("defaultHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
