import Link from "next/link";
import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="gallery-surface relative isolate min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div aria-hidden="true" className="gallery-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] min-w-0 w-full max-w-[1280px] items-stretch overflow-hidden rounded-lg border border-white/10 bg-[#160f1d]/45 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="relative">
            <Link href="/components" className="inline-flex items-center gap-3 text-sm font-semibold">
              <span className="brand-gradient-soft flex size-9 items-center justify-center rounded-lg border border-primary/30 text-pink-100"><BookOpen className="size-4" /></span>
              ATLAS <span className="font-normal text-muted-foreground">/ Workspace</span>
            </Link>
            <Badge variant="outline" className="mt-16">KNOWLEDGE OS · 2026</Badge>
            <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-tight">让团队知识保持清晰、可信、随时可用。</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">连接研究、文档与灵感，让每一次检索都有来源，每一次协作都留下上下文。</p>
          </div>
          <div className="relative grid gap-3 text-sm text-pink-100/90">
            {["集中管理团队知识", "保留可信引用与上下文", "安全访问你的专属工作空间"].map((item) => (
              <div key={item} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-pink-300" />{item}</div>
            ))}
          </div>
        </section>
        <section className="flex min-w-0 w-full max-w-full items-center justify-center p-5 sm:p-10 lg:p-14">
          <div className="min-w-0 w-full max-w-md">
            <Link href="/components" className="mb-10 flex items-center gap-3 text-sm font-semibold lg:hidden">
              <span className="brand-gradient-soft flex size-9 items-center justify-center rounded-lg border border-primary/30 text-pink-100"><Sparkles className="size-4" /></span>
              ATLAS / Workspace
            </Link>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
