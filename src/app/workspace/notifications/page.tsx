"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead, Notification } from "@/lib/api/client";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]); const [unread, setUnread] = useState(0); const [onlyUnread, setOnlyUnread] = useState(false); const [deleting, setDeleting] = useState<Notification | null>(null);
  const load = useCallback(() => listNotifications({ unread_only: onlyUnread }).then((value) => { setItems(value.items); setUnread(value.unread_count); }).catch(() => toast.error("消息加载失败")), [onlyUnread]);
  useEffect(() => { void load(); }, [load]);
  async function read(item: Notification) { if (!item.read_at) { await markNotificationRead(item.id); await load(); } }
  async function readAll() { await markAllNotificationsRead(); await load(); toast.success("已全部标记为已读"); }
  async function remove() { if (!deleting) return; await deleteNotification(deleting.id); setDeleting(null); await load(); toast.success("消息已删除"); }
  return <WorkspaceShell><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><Badge variant="outline">消息列表</Badge><h1 className="mt-3 text-2xl font-semibold">通知中心</h1><p className="mt-2 text-sm text-muted-foreground">{unread} 条未读消息</p></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm"><Switch checked={onlyUnread} onCheckedChange={setOnlyUnread} />仅看未读</label><Button variant="outline" onClick={readAll}><CheckCheck />全部已读</Button></div></div>
    <div className="glass-surface overflow-hidden rounded-lg border">{items.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center"><Bell className="size-8 text-pink-200/70" /><p className="mt-3 text-sm">暂无消息</p></div> : items.map((item) => { const token = item.invitation_id ? `direct-${item.invitation_id}` : null; return <div key={item.id} className="flex gap-4 border-b border-white/10 p-4 last:border-0"><button className="min-w-0 flex-1 text-left" onClick={() => void read(item)}><div className="flex items-center gap-2"><h2 className="text-sm font-medium">{item.title}</h2>{!item.read_at && <span className="size-2 rounded-full bg-pink-400" />}</div><p className="mt-1 text-sm text-muted-foreground">{item.body}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("zh-CN")}</p></button><div className="flex items-center gap-2">{token && <Button asChild size="sm"><Link href={`/workspace/invitations/${token}`}>查看邀请</Link></Button>}<Button size="icon-sm" variant="ghost" aria-label="删除消息" onClick={() => setDeleting(item)}><Trash2 /></Button></div></div>; })}</div>
    <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><DialogContent><DialogHeader><DialogTitle>删除消息？</DialogTitle><DialogDescription>此操作只会从你的消息列表中删除记录，不会改变邀请状态。</DialogDescription></DialogHeader><DialogFooter showCloseButton><Button variant="destructive" onClick={remove}>确认删除</Button></DialogFooter></DialogContent></Dialog>
  </WorkspaceShell>;
}
