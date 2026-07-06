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
