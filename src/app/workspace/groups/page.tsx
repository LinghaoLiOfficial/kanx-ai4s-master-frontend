"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroup, Group, listGroups } from "@/lib/api/client";

const roleLabels = { owner: "所有者", admin: "管理员", member: "成员" } as const;

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => listGroups().then((value) => setGroups(value.items)).catch(() => toast.error("群组加载失败")), []);
  useEffect(() => { void load(); }, [load]);
  async function create() { if (!name.trim()) return; setBusy(true); try { await createGroup(name.trim()); setName(""); setOpen(false); await load(); toast.success("群组已创建"); } catch { toast.error("创建失败"); } finally { setBusy(false); } }
  return <WorkspaceShell><div className="mb-6 flex items-end justify-between gap-4"><div><Badge variant="outline">群组管理</Badge><h1 className="mt-3 text-2xl font-semibold">我的群组</h1><p className="mt-2 text-sm text-muted-foreground">管理成员、权限和群组文件空间。</p></div><Button onClick={() => setOpen(true)}><Plus />创建群组</Button></div>
    {groups.length === 0 ? <div className="glass-surface flex min-h-64 flex-col items-center justify-center rounded-lg border"><Users className="size-8 text-pink-200/70" /><p className="mt-4 text-sm">还没有群组</p><Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus />创建群组</Button></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <Card key={group.id} interactive className="p-5"><Link href={`/workspace/groups/${group.id}`} className="block"><div className="flex items-start justify-between"><span className="brand-gradient-soft flex size-10 items-center justify-center rounded-md border border-primary/20"><Users className="size-5" /></span><Badge variant="secondary">{roleLabels[group.role]}</Badge></div><h2 className="mt-5 font-medium">{group.name}</h2><p className="mt-2 text-xs text-muted-foreground">{group.member_count} 位成员 · 独立文件空间</p></Link></Card>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>创建群组</DialogTitle><DialogDescription>创建后你将成为群组 owner。</DialogDescription></DialogHeader><div className="grid gap-2"><Label htmlFor="group-name">群组名称</Label><Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：算法研究组" /></div><DialogFooter showCloseButton><Button disabled={busy || !name.trim()} onClick={create}>创建</Button></DialogFooter></DialogContent></Dialog>
  </WorkspaceShell>;
}
