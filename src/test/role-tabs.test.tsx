import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Interaction tests for the role page tabs: each button must switch what is shown.
// Network, server functions and the graph library are stubbed so only the UI is tested.

const generatePlan = vi.fn();
const askRole = vi.fn();
const translateItems = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...p }: { children: ReactNode }) => <a {...(p as object)}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => fn,
  createServerFn: () => ({ middleware: () => ({ inputValidator: () => ({ handler: () => vi.fn() }) }) }),
}));
vi.mock("@/lib/roles.functions", () => ({
  translateItems,
  generatePlan: (...a: unknown[]) => generatePlan(...a),
  askRole: (...a: unknown[]) => askRole(...a),
  processInput: vi.fn(),
}));
vi.mock("@/components/AppHeader", () => ({ AppHeader: () => <header /> }));
vi.mock("@/components/role/MapGraph", () => ({ default: () => <div data-testid="visual-map">graph</div> }));
vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  const q = () => chain;
  Object.assign(chain, {
    select: q, eq: q, order: q, in: q, update: q, insert: q, limit: q,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    then: (r: (v: unknown) => unknown) => r({ data: [], error: null }),
  });
  return {
    supabase: {
      from: () => chain,
      auth: { getSession: async () => ({ data: { session: null } }) },
      storage: { from: () => ({ createSignedUrl: async () => ({ data: null }) }) },
    },
  };
});

import { RoleWorkspace } from "@/components/role/RoleWorkspace";

const ROLE = "11111111-1111-4111-8111-111111111111";

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  qc.setQueryData(["role", ROLE], {
    id: ROLE, company_id: "c1", title: "Accounts Lead", holder_name: "Anitha", successor_name: "Faizal",
    status: "leaving", onboarding_plan: null, departments: { name: "Finance" }, companies: { name: "Sample Co", is_sample: true },
  });
  qc.setQueryData(["role", ROLE, "items"], {
    items: [{ id: "i1", kind: "recurring_task", title: "File GSTR-1", body: "Before the 11th", cadence: "Monthly", translations: {}, source_input_id: null, media: null, mentions: 1, last_seen_at: new Date().toISOString(), original_quote: null }],
    links: [],
  });
  qc.setQueryData(["role", ROLE, "inputs"], []);
  qc.setQueryData(["role", ROLE, "changes"], []);
  render(
    <QueryClientProvider client={qc}>
      <RoleWorkspace roleId={ROLE} />
    </QueryClientProvider>,
  );
}

const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(`^${name}`) });

describe("Role page tabs", () => {
  beforeEach(() => {
    generatePlan.mockReset();
    askRole.mockReset();
    translateItems.mockReset();
    localStorage.removeItem("kaimaaral-lang");
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  });

  it("Visual button shows the visual map", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Visual/ }));
    expect(await screen.findByTestId("visual-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Visual/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("guided walkthrough visits eight steps without running business actions and restores the prior panel", async () => {
    setup();
    fireEvent.click(tab("Capture"));
    fireEvent.click(screen.getByRole("button", { name: "Guided walkthrough" }));
    const panels = ["Map", "Map", "Map", "Capture", "Review", "Ask", "Plan", "Plan"];
    for (const [i, name] of panels.entries()) {
      expect(tab(name)).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      if (i === 2) expect(await screen.findByTestId("visual-map")).toBeInTheDocument();
      if (i < 7) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tab("Capture")).toHaveAttribute("aria-selected", "true");
    expect(generatePlan).not.toHaveBeenCalled();
    expect(askRole).not.toHaveBeenCalled();
  });

  it("walkthrough supports previous, skip, replay and Escape without retaining a step", async () => {
    setup();
    const start = () => fireEvent.click(screen.getByRole("button", { name: "Guided walkthrough" }));
    start();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    start();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("[data-tour-workspace]")).not.toHaveAttribute("inert");
  });

  it("translation rejection clears loading and requires an explicit retry", async () => {
    localStorage.setItem("kaimaaral-lang", "ml");
    translateItems.mockRejectedValue(new Error("Translation service unavailable"));
    setup();
    const retry = await screen.findByRole("button", { name: "Retry translation" });
    expect(screen.queryByText("Translating…")).not.toBeInTheDocument();
    expect(translateItems).toHaveBeenCalledTimes(1);
    fireEvent.click(retry);
    await waitFor(() => expect(translateItems).toHaveBeenCalledTimes(2));
  });

  it("Capture tab opens the recorder", async () => {
    setup();
    fireEvent.click(tab("Capture"));
    expect(tab("Capture")).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByText(/What did you decide today/)).toBeInTheDocument();
  });

  it("phone panel navigation can return to Map after Capture, Plan and Ask", async () => {
    setup();
    for (const name of ["Capture", "Plan", "Ask", "Map"]) {
      fireEvent.click(tab(name));
      expect(tab(name)).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel")).toHaveAttribute("id", `panel-${name.toLowerCase()}`);
    }
    expect(await screen.findByText("File GSTR-1")).toBeInTheDocument();
  });

  it("Review tab opens the change review", async () => {
    setup();
    fireEvent.click(tab("Review"));
    expect(tab("Review")).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByText(/All up to date/)).toBeInTheDocument();
  });

  it("Ask tab sends a question and shows the answer", async () => {
    askRole.mockResolvedValue({ ok: true, answer: "Pay through the bank portal.", cited_ids: ["i1"], checklist: [] });
    setup();
    fireEvent.click(tab("Ask"));
    fireEvent.change(await screen.findByLabelText("Your question"), { target: { value: "How do I pay?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Pay through the bank portal.")).toBeInTheDocument();
    expect(askRole).toHaveBeenCalledTimes(1);
  });

  it("Plan tab button asks for a plan", async () => {
    generatePlan.mockResolvedValue({ ok: false, error: "x" });
    setup();
    fireEvent.click(tab("Plan"));
    fireEvent.click(await screen.findByRole("button", { name: /Make the plan/ }));
    await waitFor(() => expect(generatePlan).toHaveBeenCalledWith({ data: { roleId: ROLE, language: "en" } }));
  });
});
