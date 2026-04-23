import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const locale = req.headers.get("x-locale") ?? "en";
  const zh = locale === "zh";

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: zh ? "请填写邮箱和密码" : "Please enter your email and password" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: zh ? "邮箱或密码错误" : "Incorrect email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: zh ? "邮箱或密码错误" : "Incorrect email or password" },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createSessionToken(user.id);
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    setSessionCookie(response, token, expiresAt);

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: zh ? "登录失败，请稍后重试" : "Login failed, please try again" },
      { status: 500 }
    );
  }
}
