import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
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

describe("Page.Bar", () => {
  it("should render the title in an h1", () => {
    const { getByRole } = render(<Page.Bar title="My page" />);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toBe("My page");
  });

  it("should render a ReactNode title", () => {
    const { getByText } = render(
      <Page.Bar title={<span data-testid="custom-title">Custom</span>} />,
    );
    expect(getByText("Custom")).toBeInTheDocument();
  });

  it("should render leading when provided", () => {
    const { getByText } = render(
      <Page.Bar title="T" leading={<button>Menu</button>} />,
    );
    expect(getByText("Menu")).toBeInTheDocument();
  });

  it("should NOT render leading slot when omitted", () => {
    const { container } = render(<Page.Bar title="T" />);
    expect(container.querySelector("[class*='leading']")).toBeNull();
  });

  it("should render trailing when provided", () => {
    const { getByText } = render(
      <Page.Bar title="T" trailing={<button>Avatar</button>} />,
    );
    expect(getByText("Avatar")).toBeInTheDocument();
  });

  it("should NOT render trailing slot when omitted", () => {
    const { container } = render(<Page.Bar title="T" />);
    expect(container.querySelector("[class*='trailing']")).toBeNull();
  });

  it("should include the base bar class", () => {
    const { container } = render(<Page.Bar title="T" />);
    expect((container.firstChild as HTMLElement).className).toContain("bar");
  });

  it("should render a <header> element", () => {
    const { container } = render(<Page.Bar title="T" />);
    expect((container.firstChild as HTMLElement).tagName).toBe("HEADER");
  });

  it("should be responsive (no size class) by default", () => {
    const { container } = render(<Page.Bar title="T" />);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).not.toContain("large");
    expect(cls).not.toContain("compact");
  });

  it("should apply the large class when size=large", () => {
    const { container } = render(<Page.Bar title="T" size="large" />);
    expect((container.firstChild as HTMLElement).className).toContain("large");
  });

  it("should apply the compact class when size=compact", () => {
    const { container } = render(<Page.Bar title="T" size="compact" />);
    expect((container.firstChild as HTMLElement).className).toContain("compact");
  });

  it("should include custom className", () => {
    const { container } = render(<Page.Bar title="T" className="custom" />);
    expect((container.firstChild as HTMLElement).className).toContain("custom");
  });
});

describe("Page — actions globales portées par le layout", () => {
  it("injects the default global trio into Page.Bar when none provided", () => {
    const { getByRole } = render(
      <Page>
        <Page.Bar title="Accueil" />
      </Page>,
    );
    expect(getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(getByRole("button", { name: "Réglages" })).toBeInTheDocument();
  });

  it("renders the trailing slot even when the page provides no trailing", () => {
    const { container } = render(
      <Page>
        <Page.Bar title="Accueil" />
      </Page>,
    );
    expect(container.querySelector("[class*='trailing']")).not.toBeNull();
  });

  it("lets Page.globalActions override the default trio", () => {
    const { getByText, queryByRole } = render(
      <Page globalActions={<button>Custom</button>}>
        <Page.Bar title="Accueil" />
      </Page>,
    );
    expect(getByText("Custom")).toBeInTheDocument();
    expect(queryByRole("button", { name: "Notifications" })).toBeNull();
  });

  it("suppresses global actions when Page.globalActions is null", () => {
    const { container, queryByRole } = render(
      <Page globalActions={null}>
        <Page.Bar title="Accueil" />
      </Page>,
    );
    expect(queryByRole("button", { name: "Notifications" })).toBeNull();
    expect(container.querySelector("[class*='trailing']")).toBeNull();
  });

  it("renders page-specific trailing alongside the layout global actions", () => {
    const { getByText, getByRole } = render(
      <Page>
        <Page.Bar title="Accueil" trailing={<button>Extra</button>} />
      </Page>,
    );
    expect(getByText("Extra")).toBeInTheDocument();
    expect(getByRole("button", { name: "Notifications" })).toBeInTheDocument();
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
  it("should render Bar + Toolbar + Body together", () => {
    const { getByRole, getByText } = render(
      <Page globalActions={null}>
        <Page.Bar title="Agents" trailing={<button>A</button>} />
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

describe("Page.Body — états natifs", () => {
  it("should render a skeleton when isLoading", () => {
    const { container } = render(
      <Page>
        <Page.Body isLoading />
      </Page>,
    );
    expect(
      container.querySelector("[class*='bodySkeleton']"),
    ).toBeInTheDocument();
  });

  it("should render the empty state when isEmpty", () => {
    const { getByText } = render(
      <Page>
        <Page.Body isEmpty emptyTitle="Vide" />
      </Page>,
    );
    expect(getByText("Vide")).toBeInTheDocument();
  });

  it("should render the error state with a retry button", () => {
    const onRetry = vi.fn();
    const { getByText, getByRole } = render(
      <Page>
        <Page.Body error="Erreur X" onRetry={onRetry} />
      </Page>,
    );
    expect(getByText("Erreur X")).toBeInTheDocument();
    fireEvent.click(getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should render children when no state flag is set", () => {
    const { getByText } = render(
      <Page>
        <Page.Body>
          <p>Contenu</p>
        </Page.Body>
      </Page>,
    );
    expect(getByText("Contenu")).toBeInTheDocument();
  });
});
