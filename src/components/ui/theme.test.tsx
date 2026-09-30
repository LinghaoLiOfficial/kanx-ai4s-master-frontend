import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Alert } from "./alert";
import { PaginationLink } from "./pagination";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

afterEach(cleanup);

describe("knowledge theme", () => {
  it("keeps the exact brand endpoints and themed neutral surfaces", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain("--brand-start: #FF0076; --brand-end: #590FB7;");
    expect(css).toContain("--brand-gradient: linear-gradient(135deg, var(--brand-start), var(--brand-end));");
    expect(css).toMatch(/--secondary: #32243e;/);
    expect(css).toMatch(/--popover: #251d31f2;/);
    expect(css).toContain(".glass-surface");
    expect(css).toContain(".glass-popover");
    expect(css).toContain(".glass-field");
    expect(css).toContain(".brand-gradient-soft");
  });

  it("uses brand styles for primary controls, badges and avatar fallbacks", () => {
    render(<><Button>新建</Button><Badge>进行中</Badge><Badge variant="secondary">更新</Badge><Badge variant="outline">筛选</Badge>
      <Avatar><AvatarFallback>YL</AvatarFallback></Avatar></>);
    expect(screen.getByRole("button", { name: "新建" }).className).toContain("brand-gradient-control");
    expect(screen.getByText("进行中").className).toContain("brand-gradient-control");
    expect(screen.getByText("进行中").className).toContain("border-0!");
    expect(screen.getByText("更新").className).toContain("brand-gradient-soft");
    expect(screen.getByText("筛选").className).toContain("brand-gradient-subtle");
    expect(screen.getByText("YL").className).toContain("brand-gradient-soft");
  });

  it("uses glass surfaces for reusable panels", () => {
    render(<><Card interactive>卡片</Card><Alert>提示</Alert><Button variant="secondary">次级操作</Button></>);
    expect(screen.getByText("卡片").className).toContain("glass-surface");
    expect(screen.getByText("卡片").getAttribute("data-interactive")).toBe("true");
    expect(screen.getByText("卡片").className).toContain("cursor-pointer");
    expect(screen.getByText("卡片").className).toContain("hover:bg-primary/15!");
    expect(screen.getByText("卡片").className).not.toContain("hover:-translate-y");
    expect(screen.getByRole("alert").className).toContain("glass-surface");
    expect(screen.getByRole("button", { name: "次级操作" }).className).toContain("glass-surface");
  });

  it("highlights selected navigation in the same palette", () => {
    render(<><Tabs defaultValue="one"><TabsList><TabsTrigger value="one">最近</TabsTrigger></TabsList></Tabs>
      <PaginationLink href="#" isActive>1</PaginationLink></>);
    expect(screen.getByRole("tab", { name: "最近" }).className).toContain("data-active:bg-primary/20");
    expect(screen.getByRole("link", { name: "1" }).className).toContain("brand-gradient-control");
  });
});
