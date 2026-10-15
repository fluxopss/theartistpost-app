/// <reference types="jest" />
import { fetch as expoFetch } from "expo/fetch";

import { api } from "./client";

jest.mock("expo/fetch", () => ({ fetch: jest.fn() }));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { version: "1.0.0" } } }));
jest.mock("@/auth/token", () => ({ getAuthToken: () => "test-token" }));
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
