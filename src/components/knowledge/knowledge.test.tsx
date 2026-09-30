import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CollectionNav, DocumentRow, KnowledgeSearch, TagPicker } from "./index";

afterEach(cleanup);

describe("knowledge components", () => {
  it("reports search edits and clear requests", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<KnowledgeSearch value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: "搜索知识库" }), "检索");
    expect(onChange).toHaveBeenCalledWith("检");
    rerender(<KnowledgeSearch value="检索" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "清除搜索" }));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("toggles tags and selects collections through callbacks", async () => {
    const onTags = vi.fn();
    const onCollection = vi.fn();
    render(<><TagPicker tags={["AI", "检索"]} selected={["AI"]} onChange={onTags} />
      <CollectionNav collections={[{ id: "all", name: "全部", count: 2 }, { id: "research", name: "研究", count: 1 }]} value="all" onChange={onCollection} /></>);
    await userEvent.click(screen.getByRole("button", { name: "检索" }));
    expect(onTags).toHaveBeenCalledWith(["AI", "检索"]);
    await userEvent.click(screen.getByRole("button", { name: "AI" }));
    expect(onTags).toHaveBeenLastCalledWith([]);
    await userEvent.click(screen.getByRole("button", { name: /研究/ }));
    expect(onCollection).toHaveBeenCalledWith("research");
  });

  it("opens the document identified by its id", async () => {
    const onOpen = vi.fn();
    render(<DocumentRow document={{ id: "doc-1", title: "设计原则", summary: "摘要", collection: "研究", updatedAt: "今天", tags: ["AI"] }} onOpen={onOpen} />);
    const documentCard = screen.getByRole("button", { name: /设计原则/ });
    expect(documentCard.className).toContain("flex-col");
    expect(documentCard.className).toContain("cursor-pointer");
    expect(documentCard.className).toContain("hover:bg-primary/15!");
    expect(documentCard.className).not.toContain("hover:-translate-y");
    expect(documentCard.textContent).toContain("研究");
    expect(documentCard.textContent).toContain("今天");
    await userEvent.click(documentCard);
    expect(onOpen).toHaveBeenCalledWith("doc-1");
  });
});

describe("dialog primitive", () => {
  it("opens and closes by keyboard", async () => {
    render(<Dialog><DialogTrigger asChild><button>打开弹窗</button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>新建文档</DialogTitle><DialogDescription>设置标题</DialogDescription></DialogHeader></DialogContent></Dialog>);
    fireEvent.click(screen.getByRole("button", { name: "打开弹窗" }));
    expect(screen.getByRole("dialog", { name: "新建文档" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
