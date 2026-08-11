// Tests unitaires pour le composant Table et ses sous-composants
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TablePagination,
  TableRow,
  TableView,
  TableSelectionBar,
  type TableSortDirection,
} from "./Table";

describe("Table", () => {
  // -------------------------------------------------------------------
  // Rendu de base
  // -------------------------------------------------------------------

  it("should render a <table> element", () => {
    render(
      <Table aria-label="Data">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Header</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByLabelText("Data")).toBeInTheDocument();
  });

  it("should render a header row with columnheader role", () => {
    render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
            <TableCell>B</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("should render body cells", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Bob</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // Density
  // -------------------------------------------------------------------

  it("should default density to 'default' when none provided", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).toHaveAttribute(
      "data-density",
      "default",
    );
  });

  it("should apply density prop on the table root", () => {
    render(
      <Table aria-label="x" density="compact">
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).toHaveAttribute(
      "data-density",
      "compact",
    );
  });

  // -------------------------------------------------------------------
  // TableRow — selected / clickable
  // -------------------------------------------------------------------

  it("should mark a row as selected via data-selected + aria-selected", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow isSelected>
            <TableCell>selected</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>not selected</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const rows = screen.getAllByRole("row");
    expect(rows[0]).toHaveAttribute("data-selected", "true");
    expect(rows[0]).toHaveAttribute("aria-selected", "true");
    expect(rows[1]).not.toHaveAttribute("data-selected");
  });

  it("should call onClick when a clickable row is clicked", () => {
    const handleClick = vi.fn();
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onClick={handleClick}>
            <TableCell>tap</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    fireEvent.click(screen.getByText("tap"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should mark a row as clickable via data-clickable when onClick is provided", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onClick={() => undefined}>
            <TableCell>tap</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row")).toHaveAttribute("data-clickable", "true");
  });

  // -------------------------------------------------------------------
  // TableRow — interactive (href / onPress) — D16
  // -------------------------------------------------------------------

  it("should render an <a href> in the primary cell without any role/tabindex on the <tr> (href)", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow href="/sites/1">
            <TableCell>Site A</TableCell>
            <TableCell>extra</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const link = screen.getByRole("link", { name: "Site A" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/sites/1");
    // Le <tr> reste une vraie ligne : ni rôle ni tabindex parasite.
    const row = screen.getByRole("row");
    expect(row).not.toHaveAttribute("role");
    expect(row).not.toHaveAttribute("tabindex");
  });

  it("should render a <button> in the primary cell and call onPress (onPress)", () => {
    const onPress = vi.fn();
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onPress={onPress}>
            <TableCell>Detail</TableCell>
            <TableCell>extra</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const btn = screen.getByRole("button", { name: "Detail" });
    expect(btn.tagName).toBe("BUTTON");
    fireEvent.click(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should use the isRowAnchor cell as the anchor, not the first cell", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow href="/sites/1">
            <TableCell>first</TableCell>
            <TableCell isRowAnchor>anchor</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("link")).toHaveTextContent("anchor");
    expect(screen.getByText("first").closest("a")).toBeNull();
  });

  it("should delegate a click on a non-anchor cell to the anchor (onPress)", () => {
    const onPress = vi.fn();
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onPress={onPress}>
            <TableCell>title</TableCell>
            <TableCell>meta</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    fireEvent.click(screen.getByText("meta"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should NOT delegate when clicking an interactive element inside the row", () => {
    const onPress = vi.fn();
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onPress={onPress}>
            <TableCell>title</TableCell>
            <TableCell>
              <button type="button">act</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    fireEvent.click(screen.getByText("act"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("should NOT delegate while a text selection is active", () => {
    const onPress = vi.fn();
    const sel = vi.spyOn(window, "getSelection").mockReturnValue({
      type: "Range",
      toString: () => "texte sélectionné",
    } as unknown as Selection);
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onPress={onPress}>
            <TableCell>title</TableCell>
            <TableCell>meta</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    fireEvent.click(screen.getByText("meta"));
    expect(onPress).not.toHaveBeenCalled();
    sel.mockRestore();
  });

  it("should forward modifier keys to the anchor when delegating (href → nouvel onglet)", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow href="/sites/1">
            <TableCell>Site A</TableCell>
            <TableCell>extra</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const link = screen.getByRole("link");
    let forwardedCtrl: boolean | null = null;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      forwardedCtrl = e.ctrlKey;
    });
    fireEvent.click(screen.getByText("extra"), { ctrlKey: true });
    expect(forwardedCtrl).toBe(true);
  });

  it("should warn when both href and onPress are provided (href wins)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow href="/x" onPress={() => undefined}>
            <TableCell>a</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("mutuellement exclusifs"),
    );
    expect(screen.getByRole("link")).toBeInTheDocument();
    warn.mockRestore();
  });

  it("should still fire the deprecated onClick and warn in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const onClick = vi.fn();
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow onClick={onClick}>
            <TableCell>tap</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("onClick"));
    fireEvent.click(screen.getByText("tap"));
    expect(onClick).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  // -------------------------------------------------------------------
  // TableCell — align + width
  // -------------------------------------------------------------------

  it("should apply data-align on cells (default left)", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow>
            <TableCell>left</TableCell>
            <TableCell align="center">center</TableCell>
            <TableCell align="right">right</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveAttribute("data-align", "left");
    expect(cells[1]).toHaveAttribute("data-align", "center");
    expect(cells[2]).toHaveAttribute("data-align", "right");
  });

  it("should apply width via inline style", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow>
            <TableCell width={120}>fixed</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell")).toHaveStyle({ width: "120px" });
  });

  // -------------------------------------------------------------------
  // TableHeaderCell — sortable
  // -------------------------------------------------------------------

  it("should NOT render a sort icon when isSortable is false (default)", () => {
    const { container } = render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("should render a sort icon when isSortable is true", () => {
    const { container } = render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell isSortable>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should set aria-sort=none when isSortable is true and no direction", () => {
    render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell isSortable>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("should reflect sortDirection via aria-sort", () => {
    render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell isSortable sortDirection="ascending">
              Name
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("should cycle sortDirection: default → ascending → descending → default", () => {
    const captured: TableSortDirection[] = [];
    const handle = (next: TableSortDirection) => {
      captured.push(next);
    };

    const renderCell = (dir: TableSortDirection) =>
      render(
        <Table aria-label="x">
          <TableHead>
            <TableRow>
              <TableHeaderCell
                isSortable
                sortDirection={dir}
                onSortChange={handle}
              >
                Name
              </TableHeaderCell>
            </TableRow>
          </TableHead>
        </Table>,
      );

    // Click on default → should emit ascending
    const { unmount: u1 } = renderCell("default");
    fireEvent.click(screen.getByRole("columnheader"));
    u1();

    // Click on ascending → descending
    const { unmount: u2 } = renderCell("ascending");
    fireEvent.click(screen.getByRole("columnheader"));
    u2();

    // Click on descending → default
    const { unmount: u3 } = renderCell("descending");
    fireEvent.click(screen.getByRole("columnheader"));
    u3();

    expect(captured).toEqual(["ascending", "descending", "default"]);
  });

  it("should NOT emit onSortChange when the header is not sortable", () => {
    const handleSort = vi.fn();
    render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell onSortChange={handleSort}>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    fireEvent.click(screen.getByText("Name"));
    expect(handleSort).not.toHaveBeenCalled();
  });

  it("should trigger sort via Enter and Space keys", () => {
    const handleSort = vi.fn();
    render(
      <Table aria-label="x">
        <TableHead>
          <TableRow>
            <TableHeaderCell isSortable onSortChange={handleSort}>
              Name
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    const header = screen.getByRole("columnheader");
    fireEvent.keyDown(header, { key: "Enter" });
    fireEvent.keyDown(header, { key: " " });
    expect(handleSort).toHaveBeenCalledTimes(2);
  });

  // -------------------------------------------------------------------
  // colSpan pass-through
  // -------------------------------------------------------------------

  it("should propagate colSpan on TableCell", () => {
    render(
      <Table aria-label="x">
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>Wide</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell")).toHaveAttribute("colspan", "3");
  });
});

describe("TablePagination", () => {
  it("should render the default 'N–M sur Total' label", () => {
    render(
      <TablePagination
        count={100}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.getByText("1–10 sur 100")).toBeInTheDocument();
  });

  it("should render '0' bounds when count is zero", () => {
    render(
      <TablePagination
        count={0}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.getByText("0–0 sur 0")).toBeInTheDocument();
  });

  it("should call onPageChange with next page when clicking 'Page suivante'", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        count={100}
        page={2}
        rowsPerPage={10}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Page suivante"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should call onPageChange with previous page when clicking 'Page précédente'", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        count={100}
        page={2}
        rowsPerPage={10}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Page précédente"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should disable 'Page précédente' on the first page", () => {
    render(
      <TablePagination
        count={100}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Page précédente")).toBeDisabled();
  });

  it("should disable 'Page suivante' on the last page", () => {
    render(
      <TablePagination
        count={100}
        page={9}
        rowsPerPage={10}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Page suivante")).toBeDisabled();
  });

  it("should not render the rows-per-page picker when onRowsPerPageChange is omitted", () => {
    render(
      <TablePagination
        count={100}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
      />,
    );
    expect(screen.queryByText("Lignes par page :")).not.toBeInTheDocument();
  });

  it("should render the rows-per-page picker when onRowsPerPageChange is provided", () => {
    render(
      <TablePagination
        count={100}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
      />,
    );
    expect(screen.getByText("Lignes par page :")).toBeInTheDocument();
  });

  it("should render a custom labelDisplayedRows", () => {
    render(
      <TablePagination
        count={100}
        page={0}
        rowsPerPage={10}
        onPageChange={() => undefined}
        labelDisplayedRows={({ from, to, count }) =>
          `Rows ${from}-${to} of ${count}`
        }
      />,
    );
    expect(screen.getByText("Rows 1-10 of 100")).toBeInTheDocument();
  });
});

describe("TableView", () => {
  it("should render header, children, and footer when all provided", () => {
    render(
      <TableView
        header={<span data-testid="hdr">Header</span>}
        footer={<span data-testid="ftr">Footer</span>}
      >
        <span data-testid="body">Body</span>
      </TableView>,
    );
    expect(screen.getByTestId("hdr")).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("ftr")).toBeInTheDocument();
  });

  it("should NOT render a header container when header is omitted", () => {
    const { container } = render(
      <TableView>
        <span data-testid="body">Body</span>
      </TableView>,
    );
    // Only the content div should exist as a child of .view — no header/footer wrappers.
    const view = container.firstChild as HTMLElement | null;
    expect(view).not.toBeNull();
    expect(view!.children).toHaveLength(1);
  });

  it("should NOT render a footer container when footer is omitted but header is present", () => {
    const { container } = render(
      <TableView header={<span>Header</span>}>
        <span data-testid="body">Body</span>
      </TableView>,
    );
    const view = container.firstChild as HTMLElement | null;
    // header + content wrappers → 2 children (no footer).
    expect(view!.children).toHaveLength(2);
  });

  it("should be exposed as Table.View (compound API)", () => {
    expect(Table.View).toBe(TableView);
  });

  it("should propagate className and style to the root wrapper", () => {
    const { container } = render(
      <TableView className="custom" style={{ margin: 8 }}>
        <span>body</span>
      </TableView>,
    );
    const view = container.firstChild as HTMLElement;
    expect(view.className).toContain("custom");
    expect(view).toHaveStyle({ margin: "8px" });
  });
});

describe("TableBody — états natifs", () => {
  it("should render skeleton rows when isLoading", () => {
    const { container } = render(
      <Table aria-label="t">
        <TableBody isLoading columnCount={3} skeletonRows={4} />
      </Table>,
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(4);
    // 4 lignes × 3 cellules, un Skeleton (role=status) par cellule
    expect(screen.getAllByRole("status")).toHaveLength(12);
  });

  it("should render the empty state when isEmpty", () => {
    render(
      <Table aria-label="t">
        <TableBody isEmpty columnCount={3} emptyTitle="Rien ici" />
      </Table>,
    );
    expect(screen.getByText("Rien ici")).toBeInTheDocument();
  });

  it("should render the no-results state with default title and an action", () => {
    render(
      <Table aria-label="t">
        <TableBody
          isNoResults
          columnCount={3}
          noResultsAction={<button>Réinitialiser les filtres</button>}
        />
      </Table>,
    );
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Réinitialiser les filtres" }),
    ).toBeInTheDocument();
  });

  it("should render a custom no-results title and description", () => {
    render(
      <Table aria-label="t">
        <TableBody
          isNoResults
          columnCount={3}
          noResultsTitle="Rien ne correspond"
          noResultsDescription="Ajustez vos filtres."
        />
      </Table>,
    );
    expect(screen.getByText("Rien ne correspond")).toBeInTheDocument();
    expect(screen.getByText("Ajustez vos filtres.")).toBeInTheDocument();
  });

  it("should prioritise empty over no-results", () => {
    render(
      <Table aria-label="t">
        <TableBody isEmpty isNoResults columnCount={2} />
      </Table>,
    );
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.queryByText("Aucun résultat")).toBeNull();
  });

  it("should render the error state with a retry button", () => {
    const onRetry = vi.fn();
    render(
      <Table aria-label="t">
        <TableBody error="Boom" columnCount={3} onRetry={onRetry} />
      </Table>,
    );
    expect(screen.getByText("Boom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("should prioritise error over loading and empty", () => {
    render(
      <Table aria-label="t">
        <TableBody error isLoading isEmpty columnCount={2} />
      </Table>,
    );
    expect(screen.getByText("Une erreur est survenue")).toBeInTheDocument();
    expect(screen.queryByText("Aucune donnée")).toBeNull();
  });

  it("should render children when no state flag is set", () => {
    render(
      <Table aria-label="t">
        <TableBody columnCount={1}>
          <TableRow>
            <TableCell>Contenu</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });
});

describe("TableHeaderCell — colonne d'actions", () => {
  it("should expose an accessible name for an action column instead of an empty placeholder", () => {
    render(
      <Table aria-label="t">
        <TableHead>
          <TableRow>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell isActionColumn>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(
      screen.getByRole("columnheader", { name: "Actions" }),
    ).toBeInTheDocument();
  });

  it("should default the action column to a hidden name when no children given", () => {
    render(
      <Table aria-label="t">
        <TableHead>
          <TableRow>
            <TableHeaderCell isActionColumn />
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(
      screen.getByRole("columnheader", { name: "Actions" }),
    ).toBeInTheDocument();
  });
});

describe("Table — stickyHeader / maxHeight", () => {
  it("should mark the table as sticky-header when stickyHeader is set", () => {
    const { container } = render(
      <Table aria-label="t" stickyHeader>
        <TableHead>
          <TableRow>
            <TableHeaderCell>A</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(container.querySelector("table")).toHaveAttribute(
      "data-sticky-header",
    );
  });

  it("should wrap the table in a bounded scroll container when maxHeight is set", () => {
    const { container } = render(
      <Table aria-label="t" maxHeight={300}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>A</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    const scroller = container.querySelector("[class*='scrollContainer']");
    expect(scroller).toBeInTheDocument();
    expect(scroller).toContainElement(container.querySelector("table"));
    expect(scroller).toHaveStyle({ maxHeight: "300px" });
  });

  it("should not create a scroll container without maxHeight", () => {
    const { container } = render(
      <Table aria-label="t">
        <TableHead>
          <TableRow>
            <TableHeaderCell>A</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(
      container.querySelector("[class*='scrollContainer']"),
    ).toBeNull();
  });
});

describe("Table.SelectionBar", () => {
  it("should render a pluralized count and bulk actions", () => {
    render(
      <TableSelectionBar count={3}>
        <button>Supprimer</button>
      </TableSelectionBar>,
    );
    expect(screen.getByText("3 lignes sélectionnées")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Supprimer" }),
    ).toBeInTheDocument();
  });

  it("should render a singular label for one selected row", () => {
    render(<TableSelectionBar count={1} />);
    expect(screen.getByText("1 ligne sélectionnée")).toBeInTheDocument();
  });

  it("should render nothing when count is 0", () => {
    const { container } = render(<TableSelectionBar count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render a clear button that calls onClear", () => {
    const onClear = vi.fn();
    render(<TableSelectionBar count={2} onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Tout désélectionner" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("should accept a custom label", () => {
    render(
      <TableSelectionBar count={5} label={(n) => `${n} sélection(s)`} />,
    );
    expect(screen.getByText("5 sélection(s)")).toBeInTheDocument();
  });
});

describe("Table — colonnes responsives (hideBelow)", () => {
  it("should set data-hide-below on a header cell", () => {
    render(
      <Table aria-label="t">
        <TableHead>
          <TableRow>
            <TableHeaderCell hideBelow="md">Site</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "Site" })).toHaveAttribute(
      "data-hide-below",
      "md",
    );
  });

  it("should set data-hide-below on a body cell", () => {
    const { container } = render(
      <Table aria-label="t">
        <TableBody>
          <TableRow>
            <TableCell hideBelow="lg">06 12 34 56 78</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("td")).toHaveAttribute(
      "data-hide-below",
      "lg",
    );
  });

  it("should not set data-hide-below when the prop is absent (régression)", () => {
    const { container } = render(
      <Table aria-label="t">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Agent</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>DUPONT</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("th")).not.toHaveAttribute("data-hide-below");
    expect(container.querySelector("td")).not.toHaveAttribute("data-hide-below");
  });

  it("should NOT wrap the table by default (no layout impact)", () => {
    const { container } = render(
      <Table aria-label="t">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("[class*='queryContainer']")).toBeNull();
    // La table est rendue telle quelle (enfant direct de la racine de rendu).
    expect(container.firstElementChild?.tagName).toBe("TABLE");
  });

  it("should wrap the table in a named query container when responsive", () => {
    const { container } = render(
      <Table aria-label="t" responsive>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const wrapper = container.querySelector("[class*='queryContainer']");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toContainElement(container.querySelector("table"));
  });
});
