import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContributionCalendar } from ".";

afterEach(cleanup);
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value: () => false });
Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: vi.fn() });
Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: vi.fn() });
Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });

describe("ContributionCalendar", () => {
  it("renders a year grid and calculates totals", () => {
    render(<ContributionCalendar year={2024} data={{ "2024-01-01": 2, "2024-02-29": 4 }} />);
    expect(screen.getByText("6 次贡献")).toBeTruthy();
    expect(screen.getByRole("button", { name: "2024-02-29：4 次贡献" })).toBeTruthy();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(360);
  });

  it("supports year changes and day clicks", async () => {
    const onYearChange = vi.fn();
    const onDayClick = vi.fn();
    render(<ContributionCalendar year={2025} years={[2025, 2024]} data={{ "2025-03-03": 3 }} onYearChange={onYearChange} onDayClick={onDayClick} />);
    await userEvent.click(screen.getByRole("combobox", { name: "选择年份" }));
    await userEvent.click(await screen.findByRole("option", { name: "2024" }));
    expect(onYearChange).toHaveBeenCalledWith(2024);
    const day = screen.getByRole("button", { name: "2025-03-03：3 次贡献" });
    await userEvent.click(day);
    expect(onDayClick).toHaveBeenCalledWith("2025-03-03", 3);
  });

  it("exposes details on focus and handles empty data", async () => {
    render(<ContributionCalendar year={2023} data={{}} />);
    const day = screen.getByRole("button", { name: "2023-01-01：0 次贡献" });
    fireEvent.focus(day);
    expect(day.getAttribute("title")).toBeNull();
    expect(screen.getByRole("tooltip", { name: "2023-01-01：0 次贡献" }).getAttribute("data-side")).toBe("top");
  });

  it("updates the tooltip when moving quickly between cells", () => {
    render(<ContributionCalendar year={2024} data={{ "2024-01-01": 2, "2024-01-02": 5 }} />);
    const firstDay = screen.getByRole("button", { name: "2024-01-01：2 次贡献" });
    const secondDay = screen.getByRole("button", { name: "2024-01-02：5 次贡献" });

    fireEvent.pointerEnter(firstDay);
    fireEvent.pointerEnter(secondDay);

    expect(screen.queryByRole("tooltip", { name: "2024-01-01：2 次贡献" })).toBeNull();
    expect(screen.getByRole("tooltip", { name: "2024-01-02：5 次贡献" }).className).toContain("pointer-events-none");
  });

  it("keeps a custom detail card visible for a selected day", async () => {
    render(<ContributionCalendar
      year={2024}
      data={{ "2024-01-01": 2 }}
      dayDetails={{ "2024-01-01": { title: "研究记录更新", items: ["整理检索结果", "补充来源引用"] } }}
    />);

    await userEvent.click(screen.getByRole("button", { name: "2024-01-01：2 次贡献" }));

    const detailRegion = screen.getByRole("region", { name: "日期详情" });
    expect(detailRegion).toBeTruthy();
    expect(screen.getByRole("heading", { name: "研究记录更新" })).toBeTruthy();
    expect(detailRegion.querySelectorAll("li")).toHaveLength(2);
    expect(detailRegion.querySelectorAll("li span[aria-hidden='true']")).toHaveLength(2);
    expect(screen.getByText("整理检索结果")).toBeTruthy();
    expect(screen.getByText("补充来源引用")).toBeTruthy();

    expect(screen.queryByRole("button", { name: "关闭日期详情" })).toBeNull();
  });

  it("selects a new day on the first click after another day is selected", async () => {
    render(<ContributionCalendar
      year={2024}
      data={{ "2024-01-01": 2, "2024-01-02": 5 }}
      dayDetails={{
        "2024-01-01": { title: "第一天", items: ["第一条记录"] },
        "2024-01-02": { title: "第二天", items: ["第二条记录"] },
      }}
    />);

    await userEvent.click(screen.getByRole("button", { name: "2024-01-01：2 次贡献" }));
    await userEvent.click(screen.getByRole("button", { name: "2024-01-02：5 次贡献" }));

    expect(screen.getByRole("heading", { name: "第二天" })).toBeTruthy();
    expect(screen.getByText("第二条记录")).toBeTruthy();
    expect(screen.queryByText("第一条记录")).toBeNull();
    expect(screen.getByRole("button", { name: "2024-01-02：5 次贡献" }).className).toContain("ring-white");
    expect(screen.getByRole("button", { name: "2024-01-02：5 次贡献" }).className).toContain("border-[0.5px]");
  });

  it("closes selected details when changing years", async () => {
    render(<ContributionCalendar year={2025} years={[2025, 2024]} data={{ "2025-01-01": 1 }} />);
    await userEvent.click(screen.getByRole("button", { name: "2025-01-01：1 次贡献" }));
    expect(screen.getByRole("region", { name: "日期详情" })).toBeTruthy();
    await userEvent.click(screen.getByRole("combobox", { name: "选择年份" }));
    await userEvent.click(await screen.findByRole("option", { name: "2024" }));
    expect(screen.getByRole("region", { name: "日期详情" }).textContent).toContain("点击任意单元格查看贡献明细");
  });

  it("shows a default title and contribution bullet when day details are not provided", async () => {
    render(<ContributionCalendar year={2024} data={{ "2024-01-01": 2 }} />);
    await userEvent.click(screen.getByRole("button", { name: "2024-01-01：2 次贡献" }));
    expect(screen.getByRole("heading", { name: "2024年1月1日贡献" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "日期详情" }).textContent).toContain("2 次贡献");
  });
});
