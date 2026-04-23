"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import ChatWindow from "@/components/ChatWindow";
import RotaAvatar from "@/components/RotaAvatar";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function TopicChatPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("topicChat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleGenerateProfile = async () => {
    if (!conversationId) return;
    router.push(`/${locale}/topic/profile?conversationId=${conversationId}`);
  };

  const handleQuickStart = () => {
    router.push(`/${locale}/topic/profile?quickStart=1`);
  };

  const notes = useMemo(() => {
    return messages
      .filter((m) => m.role === "user" && m.content.trim().length > 0)
      .slice(-5)
      .reverse()
      .map((m, idx) => ({
        id: `${idx}-${m.content.slice(0, 8)}`,
        text: m.content.trim(),
      }));
  }, [messages]);

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
        <div className="flex-1 bg-white rounded-2xl border border-border p-5 overflow-hidden rota-panel flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("dialogNotes")}</h4>
            {notes.length > 0 && (
              <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            )}
          </div>
          {notes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center px-2">
              <p className="text-xs text-text-muted leading-relaxed">
                {t("notesEmpty")}
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
              {notes.map((note, idx) => (
                <li
                  key={note.id}
                  className="relative pl-3 border-l-2 border-accent/40 text-xs text-text-dim leading-relaxed"
                >
                  <span className="block text-[10px] font-semibold text-accent/80 uppercase tracking-wider mb-1">
                    {t("noteLabel", { index: notes.length - idx })}
                  </span>
                  <span className="line-clamp-3">{note.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 pt-3 border-t border-border/60 text-[10px] text-text-muted leading-relaxed">
            {t("notesFootnote")}
          </p>
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
            onConversationUpdate={(id, updated) => {
              setConversationId(id);
              if (updated) setMessages(updated);
            }}
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
