"use client";

import { BookOpen, FileText, Folder, Hash, Link2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interactiveCardClassName } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export type KnowledgeDocument = {
  id: string;
  title: string;
  summary: string;
  collection: string;
  updatedAt: string;
  tags: string[];
  initials?: string;
};

export function KnowledgeSearch({ value, onChange, placeholder = "搜索知识库...", className }: {
  value: string; onChange: (value: string) => void; placeholder?: string; className?: string;
}) {
  return <div className={cn("relative", className)}>
    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input aria-label="搜索知识库" value={value} onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder} className="glass-surface h-10 pl-10 pr-10" />
    {value && <Button type="button" variant="ghost" size="icon-xs" aria-label="清除搜索" onClick={() => onChange("")}
      className="absolute right-2 top-1/2 -translate-y-1/2"><X /></Button>}
  </div>;
}

export function DocumentRow({ document, onOpen, selected = false }: {
  document: KnowledgeDocument; onOpen: (id: string) => void; selected?: boolean;
}) {
  return <button type="button" onClick={() => onOpen(document.id)}
    className={cn("glass-surface group flex min-h-56 w-full flex-col rounded-md border p-4 text-left", interactiveCardClassName, selected && "brand-gradient-subtle border-primary/40")}>
    <span className="brand-gradient-soft flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/20 text-pink-100"><FileText className="size-5" /></span>
    <span className="mt-5 min-w-0">
      <span className="block line-clamp-2 text-sm font-medium leading-5">{document.title}</span>
      <span className="mt-2 block line-clamp-2 text-xs leading-5 text-muted-foreground">{document.summary}</span>
      <span className="mt-3 flex min-h-6 flex-wrap gap-1.5">{document.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>)}</span>
    </span>
    <span className="mt-auto flex w-full items-center gap-2 border-t border-white/10 pt-4">
      <Avatar className="size-7"><AvatarFallback className="text-[10px]">{document.initials ?? "KM"}</AvatarFallback></Avatar>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{document.collection}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{document.updatedAt}</span>
    </span>
  </button>;
}

export function TagPicker({ tags, selected, onChange }: {
  tags: string[]; selected: string[]; onChange: (tags: string[]) => void;
}) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="按标签筛选">
    {tags.map((tag) => <button key={tag} type="button" aria-pressed={selected.includes(tag)}
      onClick={() => onChange(selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag])}
      className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-ring",
        selected.includes(tag) ? "brand-gradient-soft border-primary/50 text-pink-50" : "border-white/15 bg-white/5 text-muted-foreground hover:text-foreground")}>
      <Hash className="size-3" />{tag}
    </button>)}
  </div>;
}

export type Collection = { id: string; name: string; count: number };
export function CollectionNav({ collections, value, onChange }: {
  collections: Collection[]; value: string; onChange: (id: string) => void;
}) {
  return <nav aria-label="知识集合" className="space-y-1">
    {collections.map((item) => <button key={item.id} type="button" onClick={() => onChange(item.id)}
      aria-current={value === item.id ? "page" : undefined}
      className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground",
        value === item.id && "brand-gradient-soft text-pink-50")}>
      <Folder className="size-4" /><span className="flex-1 truncate">{item.name}</span><span className="text-xs opacity-70">{item.count}</span>
    </button>)}
  </nav>;
}

export function MetadataPanel({ fields }: { fields: { label: string; value: string }[] }) {
  return <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
    {fields.map((field) => <div key={field.label} className="min-w-0"><dt className="text-xs text-muted-foreground">{field.label}</dt>
      <dd className="mt-1 truncate font-medium" title={field.value}>{field.value}</dd></div>)}
  </dl>;
}

export function CitationItem({ index, title, source, href }: {
  index: number; title: string; source: string; href: string;
}) {
  return <a href={href}
    className="glass-surface flex items-start gap-3 rounded-md border p-3 hover:border-primary/40">
    <span className="brand-gradient-soft flex size-6 shrink-0 items-center justify-center rounded text-xs text-pink-50">{index}</span>
    <span className="min-w-0 flex-1"><span className="block truncate text-sm">{title}</span><span className="text-xs text-muted-foreground">{source}</span></span>
    <Link2 className="size-4 shrink-0 text-muted-foreground" />
  </a>;
}

export function KnowledgeEmpty({ title = "暂无内容", description = "当前筛选条件下没有匹配的文档。", action }: {
  title?: string; description?: string; action?: React.ReactNode;
}) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-8 text-center">
    <BookOpen className="size-7 text-pink-200/70" /><div><h3 className="text-sm font-medium">{title}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{action}
  </div>;
}

export function KnowledgeStat({ label, value, change, progress, tone = "cyan" }: {
  label: string; value: string; change: string; progress: number; tone?: "cyan" | "violet" | "blue";
}) {
  const colors = { cyan: "text-pink-200", violet: "text-fuchsia-200", blue: "text-purple-200" };
  return <div className="min-w-0 border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="mt-2 flex items-baseline gap-2"><strong className={cn("text-2xl font-semibold", colors[tone])}>{value}</strong><span className="text-xs text-muted-foreground">{change}</span></div>
    <Progress value={progress} aria-label={label} className="mt-3 h-1 bg-white/10" />
  </div>;
}
