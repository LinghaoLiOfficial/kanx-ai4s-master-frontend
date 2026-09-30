"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Bell, BookOpen, Check, ChevronDown, CircleHelp, Command as CommandIcon, Ellipsis, FilePlus2, Filter, LayoutGrid, Menu, Plus, Search, Settings2, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CitationItem, CollectionNav, DocumentRow, KnowledgeEmpty, KnowledgeSearch, KnowledgeStat, MetadataPanel, TagPicker, type KnowledgeDocument } from "@/components/knowledge";

const collections = [
  { id: "all", name: "全部知识", count: 128 },
  { id: "research", name: "研究笔记", count: 42 },
  { id: "product", name: "产品资料", count: 36 },
  { id: "archive", name: "灵感存档", count: 50 },
];
const documents: KnowledgeDocument[] = [
  { id: "1", title: "语义检索的设计原则", summary: "从问题理解到可信引用的检索体验设计。", collection: "研究笔记", updatedAt: "2 小时前", tags: ["检索", "AI"], initials: "YL" },
  { id: "2", title: "知识图谱中的关系建模", summary: "实体、上下文与知识来源之间的连接方式。", collection: "研究笔记", updatedAt: "昨天", tags: ["图谱", "研究"], initials: "LC" },
  { id: "3", title: "工作空间信息架构", summary: "集合、文档与协作权限的产品结构。", collection: "产品资料", updatedAt: "3 天前", tags: ["产品", "设计"], initials: "MX" },
  { id: "4", title: "混合检索评估方法", summary: "结合关键词与向量召回，建立可复用的质量评估基线。", collection: "研究笔记", updatedAt: "4 天前", tags: ["检索", "研究"], initials: "QZ" },
  { id: "5", title: "知识助手交互规范", summary: "定义问答、引用展开与结果反馈的核心交互模式。", collection: "产品资料", updatedAt: "上周", tags: ["AI", "产品"], initials: "SY" },
  { id: "6", title: "团队知识流转灵感", summary: "记录从个人捕获到团队沉淀的轻量协作工作流。", collection: "灵感存档", updatedAt: "2 周前", tags: ["设计", "研究"], initials: "HW" },
];
const sections = [
  { id: "overview", label: "设计概览", number: "01" },
  { id: "knowledge", label: "知识组件", number: "02" },
  { id: "inputs", label: "输入与选择", number: "03" },
  { id: "navigation", label: "导航与数据", number: "04" },
  { id: "feedback", label: "反馈与浮层", number: "05" },
];

function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="gallery-section border-t border-white/10 py-10 sm:py-14">
    <div className="mb-8 flex items-baseline gap-5"><span className="text-xs text-pink-200/70">{number} / 05</span><h2 className="text-xl font-semibold sm:text-2xl">{title}</h2></div>
    {children}
  </section>;
}
function Demo({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><h3 className="mb-4 text-xs font-medium text-muted-foreground">{title}</h3>{children}</div>;
}

export default function ComponentsPage() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [collection, setCollection] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [density, setDensity] = useState([65]);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const filtered = useMemo(() => documents.filter((item) =>
    (collection === "all" || (collection === "research" && item.collection === "研究笔记") || (collection === "product" && item.collection === "产品资料") || (collection === "archive" && item.collection === "灵感存档")) &&
    (!tags.length || tags.some((tag) => item.tags.includes(tag))) &&
    (!query || [item.title, item.summary, item.collection, ...item.tags].some((value) => value.toLowerCase().includes(query.toLowerCase())))
  ), [query, tags, collection]);
  const openDocument = (id: string) => {
    setSelectedDocument(id);
    toast.info("已选中文档", { description: documents.find((item) => item.id === id)?.title });
  };

  return <div className="gallery-surface relative isolate">
    <div aria-hidden="true" className="gallery-grid pointer-events-none absolute inset-0 -z-10" />
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#191020]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-9">
        <Link href="/components" className="flex min-w-0 items-center gap-3"><span className="brand-gradient-soft flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/30 text-pink-100"><BookOpen className="size-4" /></span><span className="truncate text-sm font-semibold">ATLAS <span className="font-normal text-muted-foreground">/ Components</span></span></Link>
        <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:block">Knowledge system · v1.0</span><Separator orientation="vertical" className="mx-2 hidden h-4 sm:block" /><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="返回状态页" asChild><Link href="/"><LayoutGrid /></Link></Button></TooltipTrigger><TooltipContent>返回状态页</TooltipContent></Tooltip></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 px-5 py-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <p className="mb-4 hidden px-3 text-[11px] font-semibold uppercase text-muted-foreground lg:block">Library index</p>
        <nav aria-label="组件分类" className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((item) => <a key={item.id} href={`#${item.id}`} className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"><span className="hidden text-[11px] text-pink-200/60 lg:inline">{item.number}</span>{item.label}</a>)}
        </nav>
        <div className="mt-10 hidden border-t border-white/10 px-3 pt-6 text-xs leading-6 text-muted-foreground lg:block">基于 shadcn/ui · Radix UI<br />深色知识管理设计系统</div>
      </aside>
      <main className="min-w-0 px-5 pb-20 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-[1120px]">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-10 pt-12 sm:pt-16">
            <div><div className="mb-5 flex items-center gap-2 text-xs text-pink-200"><span className="size-1.5 rounded-full bg-primary" /> DESIGN SYSTEM / 2026</div><h1 className="text-3xl font-semibold sm:text-4xl">知识管理组件库</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">面向检索、整理与协作的界面语言。</p></div>
            <Badge variant="outline">Dark · Interface kit</Badge>
          </div>

          <Section id="overview" number="01" title="设计概览">
            <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <div className="glass rounded-md p-6 sm:p-8"><div className="flex items-center gap-2 text-xs text-pink-200"><Sparkles className="size-4" /> WORKSPACE PULSE</div><h3 className="mt-6 text-lg font-medium">让信息保持清晰、有序。</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">柔和光感承担氛围，信息与操作始终保持明确的对比和层级。</p><div className="mt-9 grid grid-cols-3 gap-3"><KnowledgeStat label="知识条目" value="128" change="+12%" progress={73} /><KnowledgeStat label="已连接来源" value="24" change="+4" progress={56} tone="violet" /><KnowledgeStat label="本周引用" value="86" change="+18%" progress={82} tone="blue" /></div></div>
              <div className="space-y-6"><Demo title="色彩与表面"><div className="glass flex flex-wrap items-start gap-3 rounded-md p-5">{["#100d19", "#FF0076", "#590FB7"].map((color) => <div key={color} className="text-center"><span className="block size-11 rounded-md border border-white/15" style={{ background: color }} /><span className="mt-2 block text-[10px] text-muted-foreground">{color}</span></div>)}<div className="text-center"><span className="brand-gradient-fill block h-11 w-20 rounded-md" /><span className="mt-2 block text-[10px] text-muted-foreground">主渐变 ↘</span></div></div></Demo><Demo title="卡片 · 徽标 · 头像 · 分隔线"><Card><CardHeader><CardTitle>研究空间</CardTitle><CardDescription>团队知识的共同入口</CardDescription></CardHeader><CardContent className="flex items-center gap-3"><Badge>进行中</Badge><Badge variant="secondary">12 条更新</Badge><Separator orientation="vertical" className="h-5" /><AvatarGroup><Avatar className="size-7"><AvatarFallback>YL</AvatarFallback></Avatar><Avatar className="size-7"><AvatarFallback>LC</AvatarFallback></Avatar></AvatarGroup></CardContent></Card></Demo></div>
            </div>
          </Section>

          <Section id="knowledge" number="02" title="知识组件">
            <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-8"><Demo title="集合导航"><CollectionNav collections={collections} value={collection} onChange={setCollection} /></Demo><Demo title="标签选择"><TagPicker tags={["检索", "AI", "图谱", "研究", "产品", "设计"]} selected={tags} onChange={setTags} /></Demo></div>
              <div className="min-w-0"><Demo title="搜索 · 文档网格 · 空状态"><div className="glass rounded-md p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-center gap-3"><KnowledgeSearch value={query} onChange={setQuery} className="min-w-[200px] flex-1" /><Badge variant="outline">{filtered.length} 条结果</Badge></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.length ? filtered.map((item) => <DocumentRow key={item.id} document={item} selected={selectedDocument === item.id} onOpen={openDocument} />) : <div className="col-span-full"><KnowledgeEmpty action={<Button variant="outline" size="sm" onClick={() => { setQuery(""); setTags([]); setCollection("all"); }}>清除筛选</Button>} /></div>}</div></div></Demo></div>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2"><Demo title="元数据"><MetadataPanel fields={[{ label: "所属集合", value: "研究笔记" }, { label: "最近编辑", value: "2026-09-30 09:42" }, { label: "创建者", value: "Y. Lin" }, { label: "访问级别", value: "团队可见" }]} /></Demo><Demo title="引用条目"><div className="space-y-2"><CitationItem index={1} title="语义检索的设计原则" source="研究笔记 · 第 4 段" href="#knowledge" /><CitationItem index={2} title="工作空间信息架构" source="产品资料 · 第 2 段" href="#knowledge" /></div></Demo></div>
          </Section>

          <Section id="inputs" number="03" title="输入与选择">
            <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
              <Demo title="按钮 · 尺寸 · 状态"><div className="flex flex-wrap items-center gap-2"><Button onClick={() => toast.success("已创建文档")}><Plus />新建文档</Button><Button variant="secondary"><Filter />筛选</Button><Button variant="outline">描边按钮</Button><Button variant="ghost">次要操作</Button><Button variant="destructive">移除</Button><Button disabled>不可用</Button><Button size="sm">小按钮</Button><Button size="icon" variant="outline" aria-label="更多操作"><Ellipsis /></Button></div></Demo>
              <Demo title="文本输入 · 标签 · 错误状态"><div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="demo-title">文档标题</Label><Input id="demo-title" placeholder="输入文档标题" /></div><div className="grid gap-2"><Label htmlFor="demo-error">必填字段</Label><Input id="demo-error" aria-invalid="true" aria-describedby="demo-error-hint" placeholder="请输入内容" /><span id="demo-error-hint" className="text-xs text-destructive">此字段不能为空</span></div><div className="grid gap-2"><Label htmlFor="demo-note">摘要</Label><Textarea id="demo-note" placeholder="记录关键想法..." /></div></div></Demo>
              <Demo title="复选框 · 单选 · 开关"><div className="space-y-5"><label className="flex items-center gap-3 text-sm"><Checkbox defaultChecked />允许团队成员评论</label><div className="flex items-center gap-3"><Switch id="demo-notify" defaultChecked /><Label htmlFor="demo-notify">开启更新提醒</Label></div><RadioGroup defaultValue="team" className="flex gap-6"><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="team" />团队可见</label><label className="flex items-center gap-2 text-sm"><RadioGroupItem value="private" />仅自己</label></RadioGroup></div></Demo>
              <Demo title="下拉选择 · 可搜索选项 · 滑块"><div className="grid max-w-sm gap-5"><Select defaultValue="research"><SelectTrigger className="w-full"><SelectValue placeholder="选择集合" /></SelectTrigger><SelectContent><SelectItem value="research">研究笔记</SelectItem><SelectItem value="product">产品资料</SelectItem><SelectItem value="archive">灵感存档</SelectItem></SelectContent></Select><Combobox items={["语义检索", "知识图谱", "信息架构"]}><ComboboxInput placeholder="查找主题" /><ComboboxContent><ComboboxEmpty>没有匹配主题</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><div><div className="mb-3 flex justify-between text-xs text-muted-foreground"><span>结果密度</span><span>{density[0]}%</span></div><Slider aria-label="结果密度" value={density} onValueChange={setDensity} min={0} max={100} /></div></div></Demo>
            </div>
          </Section>

          <Section id="navigation" number="04" title="导航与数据">
            <div className="grid gap-10 xl:grid-cols-2">
              <Demo title="面包屑 · 标签页"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/components">知识空间</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#knowledge">研究笔记</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>语义检索</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><Tabs defaultValue="recent" className="mt-6"><TabsList><TabsTrigger value="recent">最近访问</TabsTrigger><TabsTrigger value="saved">已收藏</TabsTrigger><TabsTrigger value="shared">共享给我</TabsTrigger></TabsList><TabsContent value="recent" className="pt-3 text-sm text-muted-foreground">最近更新的知识条目会显示在这里。</TabsContent><TabsContent value="saved" className="pt-3 text-sm text-muted-foreground">已收藏 12 条内容。</TabsContent><TabsContent value="shared" className="pt-3 text-sm text-muted-foreground">团队共享的内容。</TabsContent></Tabs></Demo>
              <Demo title="折叠内容 · 滚动区域"><Accordion type="single" collapsible defaultValue="one"><AccordionItem value="one"><AccordionTrigger>什么是知识集合？</AccordionTrigger><AccordionContent>集合用于组织相关文档，也可以按照项目或主题进行归档。</AccordionContent></AccordionItem><AccordionItem value="two"><AccordionTrigger>如何管理引用？</AccordionTrigger><AccordionContent>引用条目会记录来源与上下文，方便回溯。</AccordionContent></AccordionItem></Accordion><ScrollArea className="glass-surface mt-4 h-28 rounded-md border p-3"><div className="space-y-3 text-sm text-muted-foreground">{["研究笔记 · 检索策略", "产品资料 · 信息架构", "灵感存档 · 工作流", "研究笔记 · 图谱结构", "产品资料 · 协作权限"].map((item) => <div key={item}>{item}</div>)}</div></ScrollArea></Demo>
            </div>
            <Demo title="表格 · 分页"><div className="glass-surface overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>文档</TableHead><TableHead>集合</TableHead><TableHead>标签</TableHead><TableHead className="text-right">更新</TableHead></TableRow></TableHeader><TableBody>{documents.slice(page - 1, page).map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.title}</TableCell><TableCell>{item.collection}</TableCell><TableCell>{item.tags.join(" / ")}</TableCell><TableCell className="text-right">{item.updatedAt}</TableCell></TableRow>)}</TableBody></Table></div><Pagination className="mt-4"><PaginationContent><PaginationItem><PaginationPrevious href="#navigation" text="上一页" aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-40" : ""} onClick={() => setPage(Math.max(1, page - 1))} /></PaginationItem>{[1, 2, 3].map((number) => <PaginationItem key={number}><PaginationLink href="#navigation" isActive={page === number} onClick={() => setPage(number)}>{number}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href="#navigation" text="下一页" aria-disabled={page === 3} className={page === 3 ? "pointer-events-none opacity-40" : ""} onClick={() => setPage(Math.min(3, page + 1))} /></PaginationItem></PaginationContent></Pagination></Demo>
          </Section>

          <Section id="feedback" number="05" title="反馈与浮层">
            <div className="grid gap-10 xl:grid-cols-2">
              <Demo title="提示 · 进度 · 骨架屏"><div className="space-y-5"><Alert><CircleHelp className="size-4" /><AlertTitle>同步完成</AlertTitle><AlertDescription>所有知识来源均已更新。</AlertDescription></Alert><div className="flex items-center gap-3"><Progress value={72} className="flex-1" /><span className="text-xs text-muted-foreground">72%</span></div><div className="flex items-center gap-3"><Skeleton className="size-9 rounded-md" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div></div></Demo>
              <Demo title="弹窗 · 侧边栏 · 下拉菜单 · 气泡提示"><div className="flex flex-wrap gap-2"><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button><FilePlus2 />新建文档</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>新建文档</DialogTitle><DialogDescription>为新的知识条目设置标题。</DialogDescription></DialogHeader><Label htmlFor="new-document">文档标题</Label><Input id="new-document" value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder="例如：研究摘要" /><DialogFooter><Button disabled={!documentName.trim()} onClick={() => { toast.success("文档已创建", { description: documentName }); setDocumentName(""); setDialogOpen(false); }}>创建</Button></DialogFooter></DialogContent></Dialog><Sheet><SheetTrigger asChild><Button variant="outline"><Menu />详情面板</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>文档详情</SheetTitle><SheetDescription>来源与访问权限</SheetDescription></SheetHeader><div className="p-4"><MetadataPanel fields={[{ label: "创建者", value: "Y. Lin" }, { label: "状态", value: "已同步" }]} /></div></SheetContent></Sheet><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline"><Settings2 />操作<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>工作空间</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => toast.success("已保存设置")}><Check />保存设置</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("已发送提醒")}><Bell />发送提醒</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Popover><PopoverTrigger asChild><Button variant="ghost"><Filter />快速筛选</Button></PopoverTrigger><PopoverContent className="w-60"><p className="mb-3 text-sm font-medium">筛选条件</p><TagPicker tags={["检索", "AI", "产品"]} selected={tags} onChange={setTags} /></PopoverContent></Popover><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" aria-label="帮助"><CircleHelp /></Button></TooltipTrigger><TooltipContent>组件使用帮助</TooltipContent></Tooltip></div></Demo>
              <Demo title="命令菜单"><Command className="max-w-md border border-white/10"><CommandInput placeholder="搜索命令或文档..." /><CommandList><CommandEmpty>没有匹配结果</CommandEmpty><CommandGroup heading="快速操作"><CommandItem onSelect={() => toast.info("已打开搜索")}><Search />搜索知识</CommandItem><CommandItem onSelect={() => setDialogOpen(true)}><Plus />新建文档</CommandItem><CommandItem onSelect={() => toast.success("已打开设置")}><Settings2 />工作空间设置</CommandItem></CommandGroup></CommandList></Command></Demo>
              <Demo title="通知 · 操作反馈"><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => toast.success("同步完成", { description: "3 条文档已更新。" })}><Bell />成功通知</Button><Button variant="outline" onClick={() => toast.error("同步失败", { description: "请检查连接后重试。" })}>错误通知<ArrowRight /></Button><Button variant="ghost" onClick={() => toast.info("正在处理")}>信息提示</Button></div><div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><CommandIcon className="size-4" />弹层支持键盘焦点与 Esc 关闭</div></Demo>
            </div>
          </Section>
          <footer className="flex flex-wrap justify-between gap-3 border-t border-white/10 py-8 text-xs text-muted-foreground"><span>ATLAS / KNOWLEDGE INTERFACE SYSTEM</span><Link href="/" className="hover:text-foreground">返回状态页 →</Link></footer>
        </div>
      </main>
    </div>
  </div>;
}
