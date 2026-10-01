"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { authErrorMessage } from "@/components/auth/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, signUp } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getCurrentUser().then(() => router.replace("/workspace/files")).catch(() => undefined); }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 12) return setError("密码至少需要 12 位。");
    if (password !== confirmPassword) return setError("两次输入的密码不一致。");
    setError("");
    setSubmitting(true);
    try {
      await signUp(email, password, displayName);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Card className="min-w-0 w-full py-6">
        <CardHeader className="px-6"><CardTitle className="text-2xl">创建账户</CardTitle><CardDescription>注册后，我们会向你的邮箱发送验证链接。</CardDescription></CardHeader>
        <CardContent className="px-6">
          <form className="grid gap-4" onSubmit={submit}>
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
            <div className="grid gap-2"><Label htmlFor="display-name">显示名称</Label><Input id="display-name" required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="你的名字" className="h-10" /></div>
            <div className="grid gap-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-10" /></div>
            <div className="grid gap-2"><Label htmlFor="password">密码</Label><PasswordField id="password" autoComplete="new-password" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 12 位" /></div>
            <div className="grid gap-2"><Label htmlFor="confirm-password">确认密码</Label><PasswordField id="confirm-password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="再次输入密码" /></div>
            <Button type="submit" size="lg" className="mt-1 h-10" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{submitting ? "正在创建" : "创建账户"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">已有账户？ <Link className="text-pink-200 hover:text-pink-100" href="/login">返回登录</Link></p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
