/**
 * API helper: centralizes fetch logic with auth headers, error mapping, and JSON parsing.
 */
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Optional bearer token. Usually provided automatically via useAuthedApi. */
  token?: string | null;
  /** When true, the raw Response is returned (used for streaming). */
  rawResponse?: boolean;
  /** Optional abort signal passthrough. */
  signal?: AbortSignal;
  /** Request body can be a structured object or standard BodyInit. */
  body?: BodyInit | null | Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public payload?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, rawResponse, headers: initHeaders, body, signal, ...rest } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(initHeaders ?? {});

  let requestBody = body ?? undefined;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...rest,
    headers,
    body: requestBody as BodyInit | undefined,
    signal,
  });

  if (rawResponse) {
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return response as unknown as T;
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    throw buildErrorFromPayload(response, payload);
  }

  return payload as T;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  try {
    return await response.text();
  } catch (error) {
    return null;
  }
}

function buildErrorFromPayload(response: Response, payload: unknown): ApiError {
  const message =
    (payload as { message?: string } | null)?.message ??
    response.statusText ??
    `Request failed with status ${response.status}`;

  return new ApiError(message, response.status, payload);
}

async function buildApiError(response: Response): Promise<ApiError> {
  const payload = await parseResponsePayload(response);
  return buildErrorFromPayload(response, payload);
}

/**
 * Hook returning a memoised authed fetcher that automatically sets the bearer token from context.
 */
export function useAuthedApi() {
  const { token } = useAuth();

  return async function authedFetch<T>(path: string, options: Omit<ApiFetchOptions, "token"> = {}) {
    return apiFetch<T>(path, { ...options, token });
  };
}
