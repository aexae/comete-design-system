import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Page } from "./Page";

describe("Page", () => {
  it("should render children", () => {
    const { getByText } = render(
      <Page>
        <p>Hello</p>
      </Page>,
    );
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("should include the base page class", () => {
    const { container } = render(
      <Page>
        <p>x</p>
      </Page>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("page");
  });

  it("should include custom className", () => {
    const { container } = render(
      <Page className="custom">
        <p>x</p>
      </Page>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

describe("Page.Header", () => {
  it("should render the title in an h1", () => {
    const { getByRole } = render(<Page.Header title="My page" />);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toBe("My page");
  });

  it("should render a ReactNode title", () => {
    const { getByText } = render(
      <Page.Header title={<span data-testid="custom-title">Custom</span>} />,
    );
    expect(getByText("Custom")).toBeInTheDocument();
  });

  it("should render breadcrumbs when provided", () => {
    const { getByText, queryByText } = render(
      <Page.Header
        title="Title"
        breadcrumbs={<span>Home / Section</span>}
      />,
    );
    expect(getByText("Home / Section")).toBeInTheDocument();
    expect(queryByText("not there")).toBeNull();
  });

  it("should NOT render breadcrumbs slot when omitted", () => {
    const { container } = render(<Page.Header title="T" />);
    expect(container.querySelector("[class*='breadcrumbs']")).toBeNull();
  });

  it("should render trailing when provided", () => {
    const { getByText } = render(
      <Page.Header title="T" trailing={<button>Avatar</button>} />,
    );
    expect(getByText("Avatar")).toBeInTheDocument();
  });

  it("should NOT render trailing slot when omitted", () => {
    const { container } = render(<Page.Header title="T" />);
    expect(container.querySelector("[class*='trailing']")).toBeNull();
  });

  it("should include the base header class", () => {
    const { container } = render(<Page.Header title="T" />);
    expect((container.firstChild as HTMLElement).className).toContain(
      "header",
    );
  });

  it("should render a <header> element", () => {
    const { container } = render(<Page.Header title="T" />);
    expect((container.firstChild as HTMLElement).tagName).toBe("HEADER");
  });

  it("should include custom className", () => {
    const { container } = render(
      <Page.Header title="T" className="custom" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

describe("Page.Toolbar", () => {
  it("should render start when provided", () => {
    const { getByText } = render(<Page.Toolbar start={<span>Search</span>} />);
    expect(getByText("Search")).toBeInTheDocument();
  });

  it("should render end when provided", () => {
    const { getByText } = render(<Page.Toolbar end={<span>Action</span>} />);
    expect(getByText("Action")).toBeInTheDocument();
  });

  it("should NOT render start slot when omitted", () => {
    const { container } = render(<Page.Toolbar end={<span>E</span>} />);
    expect(container.querySelector("[class*='toolbarStart']")).toBeNull();
  });

  it("should NOT render end slot when omitted", () => {
    const { container } = render(<Page.Toolbar start={<span>S</span>} />);
    expect(container.querySelector("[class*='toolbarEnd']")).toBeNull();
  });

  it("should include the base toolbar class", () => {
    const { container } = render(<Page.Toolbar start={<span>x</span>} />);
    expect((container.firstChild as HTMLElement).className).toContain(
      "toolbar",
    );
  });

  it("should include custom className", () => {
    const { container } = render(
      <Page.Toolbar start={<span>x</span>} className="custom" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

describe("Page.Body", () => {
  it("should render children", () => {
    const { getByText } = render(
      <Page.Body>
        <p>Content</p>
      </Page.Body>,
    );
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("should render a <main> element", () => {
    const { container } = render(
      <Page.Body>
        <p>x</p>
      </Page.Body>,
    );
    expect((container.firstChild as HTMLElement).tagName).toBe("MAIN");
  });

  it("should include the base body class", () => {
    const { container } = render(
      <Page.Body>
        <p>x</p>
      </Page.Body>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("body");
  });

  it("should include custom className", () => {
    const { container } = render(
      <Page.Body className="custom">
        <p>x</p>
      </Page.Body>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

describe("Page composition", () => {
  it("should render Header + Toolbar + Body together", () => {
    const { getByRole, getByText } = render(
      <Page>
        <Page.Header title="Agents" trailing={<button>A</button>} />
        <Page.Toolbar start={<span>Search</span>} end={<span>New</span>} />
        <Page.Body>
          <p>List of agents</p>
        </Page.Body>
      </Page>,
    );
    expect(getByRole("heading", { level: 1 }).textContent).toBe("Agents");
    expect(getByText("Search")).toBeInTheDocument();
    expect(getByText("New")).toBeInTheDocument();
    expect(getByText("List of agents")).toBeInTheDocument();
  });
});
