"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ContributionData = Record<string, number>;
export type ContributionDayDetails = { title: string; items: string[] };

type ContributionDay = { date: string; count: number; month: number; day: number };
type CalendarCell = ContributionDay | null;

export type ContributionCalendarProps = {
  data: ContributionData;
  year?: number;
  years?: number[];
  onYearChange?: (year: number) => void;
  onDayClick?: (date: string, count: number) => void;
  dayDetails?: Record<string, ContributionDayDetails>;
  className?: string;
  ariaLabel?: string;
};

const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const weekNames = ["一", "二", "三", "四", "五", "六", "日"];
const intensityClasses = ["bg-white/5", "bg-[#321276]", "bg-[#590FB7]", "bg-[#A332A5]", "bg-[#FF0076]"];

function pad(value: number) { return String(value).padStart(2, "0"); }
function dateKey(year: number, month: number, day: number) { return `${year}-${pad(month + 1)}-${pad(day)}`; }
function clampCount(value: number | undefined) { return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 0; }

function buildWeeks(year: number, data: ContributionData) {
  const first = (new Date(year, 0, 1).getDay() + 6) % 7;
  const totalDays = (new Date(year + 1, 0, 1).getTime() - new Date(year, 0, 1).getTime()) / 86400000;
  const days: CalendarCell[] = Array.from({ length: first }, () => null);
  for (let index = 0; index < totalDays; index += 1) {
    const date = new Date(year, 0, index + 1);
    const month = date.getMonth();
    const day = date.getDate();
    const key = dateKey(year, month, day);
    days.push({ date: key, count: clampCount(data[key]), month, day });
  }
  while (days.length % 7) days.push(null);
  return Array.from({ length: days.length / 7 }, (_, week) => days.slice(week * 7, week * 7 + 7));
}

function intensity(count: number, max: number) {
  if (!count || !max) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

export function ContributionCalendar({ data, year: controlledYear, years, onYearChange, onDayClick, dayDetails, className, ariaLabel = "贡献日历" }: ContributionCalendarProps) {
  const currentYear = new Date().getFullYear();
  const [internalYear, setInternalYear] = useState(controlledYear ?? currentYear);
  const year = controlledYear ?? internalYear;
  const availableYears = useMemo(() => Array.from(new Set([...(years?.length ? years : [currentYear, currentYear - 1, currentYear - 2]), year])).sort((a, b) => b - a), [years, currentYear, year]);
  const weeks = useMemo(() => buildWeeks(year, data), [year, data]);
  const monthStarts = useMemo(() => monthNames.map((name, month) => ({ name, weekIndex: weeks.findIndex((week) => week.some((cell) => cell?.month === month)) })).filter((item) => item.weekIndex >= 0), [weeks]);
  const max = useMemo(() => Math.max(0, ...Object.entries(data).filter(([key]) => key.startsWith(`${year}-`)).map(([, count]) => clampCount(count))), [data, year]);
  const total = useMemo(() => weeks.flat().reduce((sum, cell) => sum + (cell?.count ?? 0), 0), [weeks]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const changeYear = (value: string) => {
    const nextYear = Number(value);
    setInternalYear(nextYear);
    setSelectedDate(null);
    onYearChange?.(nextYear);
  };
  const selectedDetails = selectedDate ? dayDetails?.[selectedDate] : undefined;
  const selectedCount = selectedDate ? clampCount(data[selectedDate]) : 0;
  const selectedDateParts = selectedDate?.split("-");
  const selectedTitle = selectedDetails?.title ?? (selectedDateParts ? `${selectedDateParts[0]}年${Number(selectedDateParts[1])}月${Number(selectedDateParts[2])}日贡献` : "日期详情");

  return <TooltipProvider><div className={cn("glass-surface rounded-lg border p-5 sm:p-6", className)} aria-label={ariaLabel}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-lg font-semibold">{total.toLocaleString()} 次贡献</p></div>
      <Select value={String(year)} onValueChange={changeYear}>
      <SelectTrigger aria-label="选择年份" className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>{availableYears.map((item) => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="min-w-0">
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[860px] grid-cols-[1rem_1fr] gap-x-2">
            <div aria-hidden="true" />
            <div className="relative h-5 text-xs text-muted-foreground">{monthStarts.map(({ name, weekIndex }) => <span key={name} className="absolute top-0" style={{ left: `${weekIndex * 16}px` }}>{name}</span>)}</div>
            <div className="grid grid-rows-7 gap-1 pt-1 text-right text-[10px] text-muted-foreground">{weekNames.map((name, index) => <span key={name} className={cn(index % 2 ? "invisible" : "flex items-center justify-end")}>{name}</span>)}</div>
            <div className="grid auto-cols-[12px] grid-flow-col grid-rows-7 gap-1 pt-1">
              {weeks.flatMap((week, weekIndex) => week.map((cell, dayIndex) => {
                if (!cell) return <span key={`empty-${weekIndex}-${dayIndex}`} aria-hidden="true" className="size-3 rounded-[3px]" />;
                const level = intensity(cell.count, max);
                const label = `${cell.date}：${cell.count} 次贡献`;
                const clearActiveDate = () => setActiveDate((active) => active === cell.date ? null : active);
                return <Tooltip key={cell.date} open={activeDate === cell.date} onOpenChange={(open) => {
                  if (open) setActiveDate(cell.date);
                  else clearActiveDate();
                }}><TooltipTrigger asChild><button type="button" aria-label={label} onPointerEnter={() => setActiveDate(cell.date)} onFocus={() => setActiveDate(cell.date)} onBlur={clearActiveDate} onClick={() => { setSelectedDate(cell.date); onDayClick?.(cell.date, cell.count); }} className={cn("size-3 rounded-[3px] border-[0.5px] border-white/10 transition-transform hover:scale-125 focus-visible:z-10 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-pink-300", intensityClasses[level], selectedDate === cell.date && "ring-1 ring-white")} /></TooltipTrigger><TooltipContent side="top" sideOffset={-4} className="pointer-events-none">{label}</TooltipContent></Tooltip>;
              }))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span aria-live="polite">{activeDate ? `${activeDate}：${clampCount(data[activeDate])} 次贡献` : "选中单元格查看详情"}</span>
          <span className="flex items-center gap-2"><span>少</span>{intensityClasses.map((tone, index) => <span key={tone} aria-label={`贡献等级 ${index}`} className={cn("size-3 rounded-[3px] border border-white/10", tone)} />)}<span>多</span></span>
        </div>
      </div>
      <aside role="region" aria-label="日期详情" className="glass-surface flex min-h-full min-w-0 flex-col rounded-lg border p-4">
        <div className="mb-3 flex items-start gap-2">
          <h3 className="min-w-0 break-words text-sm font-semibold">{selectedTitle}</h3>
        </div>
        <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          {(selectedDetails?.items ?? (selectedDate ? [`${selectedCount} 次贡献`] : ["点击任意单元格查看贡献明细"])).map((item, index) => <li key={`${item}-${index}`} className="flex min-w-0 gap-2"><span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-[#FF0076]" /><span className="min-w-0 break-words">{item}</span></li>)}
        </ul>
      </aside>
    </div>
  </div></TooltipProvider>;
}

export default ContributionCalendar;
