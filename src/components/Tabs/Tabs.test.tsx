import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabList, Tab, TabPanel } from "./index.js";

// -----------------------------------------------------------------------
// Helpers

function renderTabs(props?: { disabledKeys?: string[] }) {
  return render(
    <Tabs {...props}>
      <TabList>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
        <Tab id="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel id="tab1">Content 1</TabPanel>
      <TabPanel id="tab2">Content 2</TabPanel>
      <TabPanel id="tab3">Content 3</TabPanel>
    </Tabs>
  );
}

// -----------------------------------------------------------------------
// Tests

describe("Tabs", () => {
  it("should render all tabs", () => {
    renderTabs();
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("should render the first tab panel by default", () => {
    renderTabs();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should switch panels on tab click", async () => {
    renderTabs();
    const user = userEvent.setup();
    await user.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("should support keyboard navigation", async () => {
    renderTabs();
    const user = userEvent.setup();
    await user.click(screen.getByText("Tab 1"));
    await user.keyboard("{ArrowRight}");
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveFocus();
  });

  it("should support disabled tabs", () => {
    renderTabs({ disabledKeys: ["tab2"] });
    expect(screen.getByText("Tab 2").closest("[role=tab]")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("should not switch to disabled tab on click", async () => {
    renderTabs({ disabledKeys: ["tab2"] });
    const user = userEvent.setup();
    await user.click(screen.getByText("Tab 2"));
    // First panel should still be visible
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should render tabs with iconBefore", () => {
    render(
      <Tabs>
        <TabList>
          <Tab id="tab1" iconBefore="Star">
            Tab 1
          </Tab>
        </TabList>
        <TabPanel id="tab1">Content</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });

  it("should render tabs with iconAfter", () => {
    render(
      <Tabs>
        <TabList>
          <Tab id="tab1" iconAfter="ChevronRight">
            Tab 1
          </Tab>
        </TabList>
        <TabPanel id="tab1">Content</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });

  it("should render tabs with both icons", () => {
    render(
      <Tabs>
        <TabList>
          <Tab id="tab1" iconBefore="Star" iconAfter="ChevronRight">
            Tab 1
          </Tab>
        </TabList>
        <TabPanel id="tab1">Content</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });

  it("should apply tab role", () => {
    renderTabs();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("should apply tablist role", () => {
    renderTabs();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("should apply tabpanel role", () => {
    renderTabs();
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("should support controlled selection", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Tabs selectedKey="tab2" onSelectionChange={onSelectionChange}>
        <TabList>
          <Tab id="tab1">Tab 1</Tab>
          <Tab id="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByText("Tab 1"));
    expect(onSelectionChange).toHaveBeenCalledWith("tab1");
  });

  it("should support defaultSelectedKey", () => {
    render(
      <Tabs defaultSelectedKey="tab2">
        <TabList>
          <Tab id="tab1">Tab 1</Tab>
          <Tab id="tab2">Tab 2</Tab>
        </TabList>
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </Tabs>
    );
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });
});
