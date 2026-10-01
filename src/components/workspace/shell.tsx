"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, BookOpen, FolderKanban, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthUser, getCurrentUser, listNotifications, signOut } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/workspace/files", label: "个人文件", icon: FolderKanban },
  { href: "/workspace/groups", label: "群组管理", icon: Users },
  { href: "/workspace/notifications", label: "消息列表", icon: Bell },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`));
  }, [pathname, router]);
  useEffect(() => {
    let active = true;
    const refresh = () => listNotifications().then((value) => { if (active) setUnread(value.unread_count); }).catch(() => undefined);
    void refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  async function logout() { await signOut(); router.replace("/login"); }
  return <main className="gallery-surface flex h-screen flex-col overflow-hidden">
    <header className="border-b border-white/10 bg-[#191020]/70 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8">
      <Link href="/workspace/files" className="flex items-center gap-3 text-sm font-semibold"><span className="brand-gradient-soft flex size-8 items-center justify-center rounded-lg border border-primary/30"><BookOpen className="size-4" /></span>ATLAS <span className="font-normal text-muted-foreground">/ Workspace</span></Link>
      <div className="flex items-center gap-3">{user && <><Avatar className="size-8"><AvatarFallback>{user.display_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="hidden text-sm sm:block">{user.display_name}</span></>}<Button size="icon" variant="ghost" aria-label="退出登录" onClick={logout}><LogOut /></Button></div>
    </div></header>
    <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 gap-6 overflow-hidden px-4 py-5 sm:px-8"><aside className="hidden w-56 shrink-0 md:block"><div className="sticky top-5 space-y-6"><div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">知识空间</div><nav className="space-y-1">{links.map((item) => { const active = item.href === "/workspace/files" ? pathname === item.href || pathname.startsWith(`${item.href}/`) : pathname.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground", active && "brand-gradient-soft border border-primary/25 text-pink-50")}><Icon className="size-4" /><span className="flex-1">{item.label}</span>{item.href.endsWith("notifications") && unread > 0 && <Badge>{unread > 99 ? "99+" : unread}</Badge>}</Link>; })}</nav></div></aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">{children}</section>
    </div>
  </main>;
}
