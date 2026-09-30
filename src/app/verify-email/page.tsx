"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { authErrorMessage } from "@/components/auth/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendVerification, verifyEmail } from "@/lib/api/client";

type State = "waiting" | "verifying" | "verified" | "failed";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [state, setState] = useState<State>(token ? "verifying" : "waiting");
  const [message, setMessage] = useState(token ? "正在验证你的邮箱…" : "验证邮件已发送，请检查收件箱或本地 Mailpit。");
  const [resending, setResending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then(() => { setState("verified"); setMessage("邮箱验证成功，现在可以登录了。"); })
      .catch((error) => { setState("failed"); setMessage(authErrorMessage(error)); });
  }, [token]);

  async function resend(event: FormEvent) {
    event.preventDefault();
    if (!email) return;
    setResending(true);
    try {
      await resendVerification(email);
      setState("waiting");
      setMessage("如果该邮箱需要验证，新的验证邮件已经发送。");
    } catch (error) {
      setState("failed");
      setMessage(authErrorMessage(error));
    } finally {
      setResending(false);
    }
  }

  const Icon = state === "verified" ? CheckCircle2 : state === "failed" ? XCircle : state === "verifying" ? LoaderCircle : Mail;
  return (
    <Card className="min-w-0 w-full py-7 text-center">
      <CardHeader className="items-center px-6">
        <span className="brand-gradient-soft mb-3 flex size-14 items-center justify-center rounded-2xl border border-primary/25 text-pink-100"><Icon className={state === "verifying" ? "animate-spin" : ""} /></span>
        <CardTitle className="text-2xl">验证邮箱</CardTitle>
        <CardDescription className="max-w-sm">完成验证后，你就可以进入 ATLAS 工作空间。</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Alert variant={state === "failed" ? "destructive" : "default"} className="text-left"><AlertDescription>{message}</AlertDescription></Alert>
        {state === "verified" ? <Button asChild className="mt-6 h-10 w-full"><Link href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}>前往登录</Link></Button> : null}
        {state !== "verified" && state !== "verifying" ? (
          <form className="mt-6 grid gap-3 text-left" onSubmit={resend}>
            <Label htmlFor="verify-email">没有收到？重新发送</Label>
            <Input id="verify-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-10" />
            <Button type="submit" variant="secondary" className="h-10" disabled={resending}>{resending ? <LoaderCircle className="animate-spin" /> : <Mail />}{resending ? "正在发送" : "重新发送验证邮件"}</Button>
          </form>
        ) : null}
        <p className="mt-6 text-sm text-muted-foreground"><Link className="text-pink-200 hover:text-pink-100" href="/login">返回登录</Link></p>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return <AuthShell><Suspense fallback={<div className="text-sm text-muted-foreground">正在加载…</div>}><VerifyEmailContent /></Suspense></AuthShell>;
}
