/// <reference types="jest" />
import { fetch as expoFetch } from "expo/fetch";

import { setAuthToken } from "@/auth/token";

import { api, SESSION_EXPIRED_MESSAGE, setSessionExpiredHandler } from "./client";
import { ApiError } from "./errors";

jest.mock("expo/fetch", () => ({ fetch: jest.fn() }));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { version: "1.0.0" } } }));
jest.mock("@/auth/token", () => {
  let token: string | null = "test-token";
  return {
    getAuthToken: () => token,
    setAuthToken: (next: string | null) => {
      token = next;
    },
  };
});
jest.mock("expo-file-system", () => ({
  File: class MockFile {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
    async bytes() {
      return new Uint8Array([1, 2, 3]);
    }
  },
}));

const reply = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ ok: true, data }) });

describe("api.upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (expoFetch as unknown as jest.Mock).mockResolvedValue(reply({ avatarUrl: "https://x/uploads/a.jpg" }));
  });

  afterEach(() => jest.restoreAllMocks());

  it("appends a file the runtime can read (expo/fetch rejects { uri, name, type } parts as a network error)", async () => {
    const append = jest.spyOn(FormData.prototype, "append").mockImplementation(() => undefined);
    const result = await api.upload<{ avatarUrl: string }>("/me/avatar", {
      uri: "file:///cache/photo.jpg",
      name: "photo.jpg",
      mimeType: "image/jpeg",
    });
    expect(result.avatarUrl).toBe("https://x/uploads/a.jpg");

    const [url, init] = (expoFetch as unknown as jest.Mock).mock.calls[0] as [
      string,
      RequestInit & { headers: Record<string, string> },
    ];
    expect(url).toMatch(/\/api\/v1\/me\/avatar$/);
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer test-token");
    expect(init.headers["Content-Type"]).toBeUndefined(); // multipart boundary is the runtime's job

    expect(append).toHaveBeenCalledTimes(1);
    const [field, value] = append.mock.calls[0] as unknown as [string, { uri: string; bytes?: unknown }];
    expect(field).toBe("file");
    // a readable file, not a plain { uri, name, type } object
    expect(typeof value.bytes).toBe("function");
    expect(value.uri).toBe("file:///cache/photo.jpg");
  });
});

const unauthorized = () => ({
  ok: false,
  status: 401,
  json: async () => ({ ok: false, error: { code: "unauthorized", message: "Sign in to continue." } }),
});

describe("expired session", () => {
  const fetchMock = expoFetch as unknown as jest.Mock;
  let expired: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    expired = jest.fn(() => setAuthToken(null)); // the provider signs out, which clears the token
    setSessionExpiredHandler(expired);
  });

  afterEach(() => setSessionExpiredHandler(null));

  it("signs out once and explains, when a signed-in request gets 401", async () => {
    setAuthToken("expired-token");
    fetchMock.mockResolvedValue(unauthorized());

    const first = api.get("/me/rsvps");
    const second = api.get("/notifications");
    await expect(first).rejects.toMatchObject({ code: "unauthorized", message: SESSION_EXPIRED_MESSAGE });
    await expect(second).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("does not fire for a public request made while signed out", async () => {
    setAuthToken(null);
    fetchMock.mockResolvedValue(unauthorized());
    await expect(api.get("/events")).rejects.toMatchObject({ code: "unauthorized" });
    expect(expired).not.toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("leaves /auth/* errors to the sign-in screens", async () => {
    setAuthToken("some-token");
    fetchMock.mockResolvedValue(unauthorized());
    await expect(api.get("/auth/me")).rejects.toMatchObject({ code: "unauthorized", message: "Sign in to continue." });
    expect(expired).not.toHaveBeenCalled();
  });

  it("fires again for a later session that expires", async () => {
    setAuthToken("token-a");
    fetchMock.mockResolvedValue(unauthorized());
    await expect(api.get("/me")).rejects.toBeInstanceOf(ApiError);
    setAuthToken("token-b");
    await expect(api.get("/me")).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledTimes(2);
  });

  it("passes ordinary successes straight through", async () => {
    setAuthToken("fresh");
    fetchMock.mockResolvedValue(reply({ fine: true }));
    await expect(api.get<{ fine: boolean }>("/me")).resolves.toEqual({ fine: true });
    expect(expired).not.toHaveBeenCalled();
  });
});
