import { afterEach, describe, expect, it, vi } from "vitest";

import {
  apiRequest,
  getCurrentUser,
  getUserContext,
  listWorkspaceFiles,
  createWorkspaceFile,
  renameWorkspaceFile,
  deleteWorkspaceFile,
  getWorkspaceFile,
  saveWorkspaceFileContent,
  resendVerification,
  setAccessToken,
  signIn,
  signOut,
  signUp,
  verifyEmail,
} from "./client";

afterEach(() => {
  setAccessToken(null);
  document.cookie = "csrf_token=; Max-Age=0; path=/";
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("builds workspace file requests with pagination, filters, and organization scope", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: {}, organizations: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], page: 2, page_size: 12, total: 0, total_pages: 0 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "f1", name: "Roadmap", type: "mindmap", content: null }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "f1", name: "Renamed", type: "mindmap", content: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "f1", name: "Renamed", type: "mindmap", content: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "f1", name: "Renamed", type: "mindmap", content: { version: 2 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getUserContext();
    await listWorkspaceFiles("org/1", { page: 2, page_size: 12, query: "road map", type: "mindmap" });
    await createWorkspaceFile("org/1", { name: "Roadmap", type: "mindmap" });
    await renameWorkspaceFile("org/1", "f1", "Renamed");
    await deleteWorkspaceFile("org/1", "f1");
    await getWorkspaceFile("org/1", "f1");
    await saveWorkspaceFileContent("org/1", "f1", { version: 2 });

    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual([
      "/users/me/context",
      "/organizations/org%2F1/workspace-files",
      "/organizations/org%2F1/workspace-files",
      "/organizations/org%2F1/workspace-files/f1",
      "/organizations/org%2F1/workspace-files/f1",
      "/organizations/org%2F1/workspace-files/f1",
      "/organizations/org%2F1/workspace-files/f1",
    ]);
    expect(new URL(String(fetchMock.mock.calls[1][0])).search).toBe("?page=2&page_size=12&query=road+map&type=mindmap");
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toEqual({ name: "Roadmap", type: "mindmap" });
    expect(JSON.parse(String(fetchMock.mock.calls[3][1]?.body))).toEqual({ name: "Renamed" });
    expect(JSON.parse(String(fetchMock.mock.calls[6][1]?.body))).toEqual({ content: { version: 2 } });
  });

  it("parses the backend error envelope and request ID", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { code: "validation_error", message: "Invalid", request_id: "req-1", details: [] },
    }), { status: 422, headers: { "Content-Type": "application/json", "X-Request-ID": "req-1" } })));
    await expect(apiRequest("/bad", { authenticate: false })).rejects.toMatchObject({
      status: 422,
      error: { code: "validation_error", request_id: "req-1" },
    });
  });

  it("always sends credentialed requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    await apiRequest("/health/live", { authenticate: false });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("sends registration and verification payloads to public auth endpoints", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "registration accepted" }), { status: 202 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Email verified" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "sent" }), { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await signUp("user@example.com", "a-secure-password", "Test User");
    await verifyEmail("verification-token-value");
    await resendVerification("user@example.com");

    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual([
      "/auth/register", "/auth/verify-email", "/auth/resend-verification",
    ]);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      email: "user@example.com", password: "a-secure-password", display_name: "Test User",
    });
  });

  it("stores the access token returned by the backend login contract", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "access-1", token_type: "bearer", expires_in: 900,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "user-1", email: "user@example.com", display_name: "Test User",
        email_verified: true,
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await signIn("user@example.com", "a-secure-password");
    await getCurrentUser();

    const profileHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);
    expect(profileHeaders.get("Authorization")).toBe("Bearer access-1");
  });

  it("loads the authenticated user profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "user-1", email: "user@example.com", display_name: "Test User",
      email_verified: true,
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getCurrentUser()).resolves.toMatchObject({ id: "user-1" });
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/users/me");
  });

  it("refreshes once after a 401 and retries with the new access token", async () => {
    document.cookie = "csrf_token=csrf-1; path=/";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: {} }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-2" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user-1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await getCurrentUser();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(new URL(String(fetchMock.mock.calls[1][0])).pathname).toBe("/auth/refresh");
    expect(new Headers(fetchMock.mock.calls[1][1]?.headers).get("X-CSRF-Token")).toBe("csrf-1");
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe("Bearer access-2");
  });

  it("sends the CSRF token when logging out and clears the access token", async () => {
    document.cookie = "csrf_token=csrf-logout; path=/";
    setAccessToken("access-logout");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: {} }), { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await signOut();
    const logoutHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe("/auth/logout");
    expect(logoutHeaders.get("X-CSRF-Token")).toBe("csrf-logout");
    expect(logoutHeaders.get("Authorization")).toBe("Bearer access-logout");

    await expect(getCurrentUser()).rejects.toBeTruthy();
    expect(new Headers(fetchMock.mock.calls[1][1]?.headers).get("Authorization")).toBeNull();
  });
});
