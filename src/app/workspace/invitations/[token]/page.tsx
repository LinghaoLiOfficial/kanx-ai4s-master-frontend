"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, getDirectInvitation, getInvitation, Invitation, respondDirectInvitation, respondInvitation } from "@/lib/api/client";

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>(); const router = useRouter(); const [invite, setInvite] = useState<Invitation | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const directId = token.startsWith("direct-") ? token.slice(7) : null;
  useEffect(() => { (directId ? getDirectInvitation(directId) : getInvitation(token)).then(setInvite).catch((reason) => { if (reason instanceof ApiError && reason.status === 401) router.replace(`/login?next=${encodeURIComponent(`/workspace/invitations/${token}`)}`); else setError("邀请不存在、已失效或不属于当前用户"); }); }, [directId, router, token]);
  async function respond(action: "accept" | "decline") { setBusy(true); try { const result = directId ? await respondDirectInvitation(directId, action) : await respondInvitation(token, action); setInvite((value) => value ? { ...value, status: result.status } : value); toast.success(action === "accept" ? "已加入群组" : "已拒绝邀请"); } catch { toast.error("邀请处理失败"); } finally { setBusy(false); } }
  return <WorkspaceShell><div className="mx-auto max-w-xl pt-8"><Card className="glass-surface p-6 text-center"><MailCheck className="mx-auto size-10 text-pink-200" />{error ? <p className="mt-5 text-sm text-destructive">{error}</p> : invite ? <><Badge className="mt-5" variant="secondary">{invite.status}</Badge><h1 className="mt-4 text-xl font-semibold">加入 {invite.group_name}</h1><p className="mt-2 text-sm text-muted-foreground">{invite.inviter_name} 邀请你加入群组</p>{invite.status === "pending" ? <div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={busy} onClick={() => respond("decline")}>拒绝</Button><Button disabled={busy} onClick={() => respond("accept")}>同意加入</Button></div> : <Button className="mt-6" onClick={() => router.push(invite.status === "accepted" ? `/workspace/groups/${invite.group_id}` : "/workspace/notifications")}>继续</Button>}</> : <p className="mt-5 text-sm text-muted-foreground">正在读取邀请...</p>}</Card></div></WorkspaceShell>;
}
