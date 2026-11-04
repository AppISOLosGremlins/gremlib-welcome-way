import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { Route } from "@/routes/_authenticated/reponer";
import { stockLevel } from "@/lib/stock";
const { confirm, getCatalog } = vi.hoisted(() => ({ confirm: vi.fn(), getCatalog: vi.fn() }));
vi.mock("@/lib/member.functions", () => ({ confirmRestock: confirm, getCatalogBooks: getCatalog }));
vi.mock("@/components/staff-mode", () => ({ useStaffMode: () => ({ admin: true }) }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({ ...opts, useRouteContext: () => ({ user: { id: "staff-test" } }) }),
  Link: ({ children }: any) => <a>{children}</a>, redirect: vi.fn(),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); sessionStorage.clear(); });
it("distingue los límites inclusivos del inventario", () => {
  expect([0,5,6,10,11].map(stockLevel)).toEqual(["Crítico","Crítico","Bajo","Bajo","Normal"]);
});
it("mantiene la selección tras un fallo y reintenta la misma operación antes de vaciarla", async () => {
  const id = "4beaeb46-1a12-4bb3-8889-a77f27fee009";
  getCatalog.mockResolvedValue([{ id, title: "Libro A", author: "Autora", stock: 5 }]);
  confirm.mockRejectedValueOnce(new Error("Conexión perdida")).mockResolvedValueOnce({ confirmed: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Screen = (Route as any).component;
  render(<QueryClientProvider client={client}><Screen /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole("button", { name: /Seleccionar Libro A/ }));
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar reposición" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Conexión perdida");
  fireEvent.click(screen.getByRole("button", { name: "Confirmar reposición" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Reposición confirmada"));
  expect(confirm.mock.calls[0]).toEqual(confirm.mock.calls[1]);
  expect(confirm.mock.calls[0]?.[0].data.items).toEqual([{ id, quantity: 3 }]);
  expect(screen.queryByRole("spinbutton")).toBeNull();
});
