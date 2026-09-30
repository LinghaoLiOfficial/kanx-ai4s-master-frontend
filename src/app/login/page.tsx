"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { authErrorMessage, safeNextPath } from "@/components/auth/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, resendVerification, signIn } from "@/lib/api/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    getCurrentUser().then(() => router.replace(safeNextPath(searchParams.get("next")))).catch(() => undefined);
  }, [router, searchParams]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      await getCurrentUser();
      toast.success("登录成功", { description: "正在进入你的工作空间。" });
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email) {
      setError("请先填写需要验证的邮箱。");
      return;
    }
    setResending(true);
    setError("");
    try {
      await resendVerification(email);
      toast.success("验证邮件已发送", { description: "请检查收件箱或本地 Mailpit。" });
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setResending(false);
    }
  }

  return (
    <Card className="min-w-0 w-full py-6">
      <CardHeader className="px-6">
        <CardTitle className="text-2xl">欢迎回来</CardTitle>
        <CardDescription>登录以继续访问你的知识工作空间。</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <form className="grid gap-5" onSubmit={submit}>
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <PasswordField id="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入密码" />
          </div>
          <Button type="submit" size="lg" className="h-10" disabled={submitting}>
            {submitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{submitting ? "正在登录" : "登录"}
          </Button>
          <Button type="button" variant="ghost" disabled={resending} onClick={resend}>
            {resending ? <LoaderCircle className="animate-spin" /> : <Mail />}重新发送验证邮件
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">还没有账户？ <Link className="text-pink-200 hover:text-pink-100" href="/register">立即注册</Link></p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return <AuthShell><Suspense fallback={<div className="text-sm text-muted-foreground">正在加载…</div>}><LoginForm /></Suspense></AuthShell>;
}
