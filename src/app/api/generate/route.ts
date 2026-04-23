import { generateWithAI } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { strategyCode, input, context } = body;

  const locale = req.headers.get("x-locale") ?? "en";

  try {
    const result = await generateWithAI(strategyCode, input, context, locale);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({
      result: JSON.stringify({
        error:
          locale === "zh"
            ? "AI服务未配置，请设置 GEMINI_API_KEY"
            : "AI service not configured. Please set GEMINI_API_KEY.",
      }),
    });
  }
}
