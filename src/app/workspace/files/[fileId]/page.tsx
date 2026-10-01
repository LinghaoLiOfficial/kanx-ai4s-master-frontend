"use client";

import "kanx-mindmap/styles.css";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUserContext, getWorkspaceFile, saveWorkspaceFileContent, type WorkspaceFile } from "@/lib/api/client";
import { MindMapEditor, parseDocument, serializeDocument, type Tree } from "kanx-mindmap";

const initialTree: Tree = { rootId: "root", nodes: { root: { id: "root", parentId: null, children: [], kind: "text", text: "中心主题", collapsed: false } } };

export default function MindMapFilePage() {
  const params = useParams<{ fileId: string }>(); const router = useRouter(); const searchParams = useSearchParams(); const fileId = params.fileId;
  const [organizationId, setOrganizationId] = useState<string | null>(null); const [file, setFile] = useState<WorkspaceFile | null>(null); const [value, setValue] = useState<Tree>(initialTree); const [status, setStatus] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null); const latest = useRef<Tree>(value);
  useEffect(() => { getUserContext().then(async (context) => { const organization = searchParams.get("organization") ?? context.organizations.find((item) => item.kind === "personal")?.id; if (!organization) throw new Error("No organization"); setOrganizationId(organization); const result = await getWorkspaceFile(organization, fileId); if (result.type !== "mindmap") throw new Error("Not a mindmap"); const tree = result.content ? parseDocument(result.content) : initialTree; setFile(result); setValue(tree); latest.current = tree; setStatus("saved"); }).catch(() => { toast.error("无法打开此思维导图"); router.replace("/workspace/files"); }); }, [fileId, router, searchParams]);
  const save = useCallback(async (content: Tree) => { if (!organizationId) return; setStatus("saving"); try { await saveWorkspaceFileContent(organizationId, fileId, serializeDocument(content)); setStatus("saved"); } catch { setStatus("error"); } }, [fileId, organizationId]);
  function change(content: Tree) { setValue(content); latest.current = content; if (pending.current) clearTimeout(pending.current); setStatus("saving"); pending.current = setTimeout(() => void save(content), 800); }
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);
  if (status === "loading" || !file) return <main className="gallery-surface flex min-h-screen items-center justify-center"><LoaderCircle className="size-6 animate-spin" /></main>;
  return <main className="gallery-surface flex min-h-screen flex-col"><header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#191020]/70 px-4 backdrop-blur-xl sm:px-8"><div className="flex min-w-0 items-center gap-3"><Button asChild variant="ghost" size="icon" aria-label="返回文件管理"><Link href="/workspace/files"><ArrowLeft /></Link></Button><div className="min-w-0"><h1 className="truncate text-sm font-medium">{file.name}</h1><p className="text-xs text-muted-foreground">Mindmap</p></div></div><div className="flex items-center gap-2 text-xs text-muted-foreground">{status === "saving" && <><LoaderCircle className="size-3 animate-spin" />保存中</>}{status === "saved" && <><Check className="size-3 text-emerald-300" />已保存</>}{status === "error" && <><X className="size-3 text-destructive" />保存失败<Button variant="ghost" size="sm" onClick={() => void save(latest.current)}><RefreshCw />重试</Button></>}</div></header><div className="min-h-0 flex-1 p-3 sm:p-6"><div className="h-[calc(100vh-7.5rem)] min-h-[520px] overflow-hidden rounded-lg border border-white/15 bg-[#170f22]/80"><MindMapEditor className="workspace-mindmap-editor" value={value} onChange={change} locale="zh-CN" title="Mindmap 编辑器" /></div></div></main>;
}
