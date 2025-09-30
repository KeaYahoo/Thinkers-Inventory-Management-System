/**
 * Auth Flow Integration Test: resolved residual act warnings by wrapping navigation-triggering interactions in React act.
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { queryClient as appQueryClient } from "@/lib/queryClient";
import { createMemoryHistory } from "history";
import type { History } from "history";

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Nearby from "./pages/Nearby";
import Destinations from "./pages/Destinations";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Tours from "./pages/Tours";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

type FetchArgs = Parameters<typeof fetch>;

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("authentication flow", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const renderApp = (initialPath = "/") => {
    const history = createMemoryHistory({ initialEntries: [initialPath] });
    const queryClient = new QueryClient({ defaultOptions: appQueryClient.getDefaultOptions() });

    const view = render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <HistoryRouter
              history={history as unknown as any}
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/nearby" element={<Nearby />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/about" element={<About />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HistoryRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>,
    );

    return { history, queryClient, ...view };
  };

  it("should allow a user to log in, view the dashboard, and log out", async () => {
    const mockFetch = vi.fn(async (...args: FetchArgs) => {
      const [input, init] = args;
      const targetUrl =
        typeof input === 'string'
          ? input
          : input instanceof Request
          ? input.url
          : input instanceof URL
          ? input.toString()
          : String(input);

      const jsonResponse = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });

      if (targetUrl.endsWith('/api/auth/login') && init?.method === 'POST') {
        return jsonResponse({ token: 'fake-jwt-token' });
      }

      if (targetUrl.endsWith('/api/destinations')) {
        return jsonResponse([]);
      }

      if (targetUrl.endsWith('/api/services')) {
        return jsonResponse([]);
      }

      if (targetUrl.endsWith('/api/my-bookings')) {
        return jsonResponse([]);
      }

      if (targetUrl.includes('/api/trips')) {
        return jsonResponse([]);
      }

      return jsonResponse({});
    });

    vi.stubGlobal("fetch", mockFetch);

    const { history } = renderApp("/");

    await act(async () => {
      fireEvent.click(screen.getAllByRole("link", { name: /log in/i })[0]);
    });

    await screen.findByLabelText(/email/i);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /^log in$/i })[1]);
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /my dashboard/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /log out/i })[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: /log in/i })[0]).toBeInTheDocument();
    });

    await act(async () => {
      history.push("/dashboard");
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    });
  });
});
