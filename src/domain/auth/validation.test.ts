import { artistJoinSchema, composePostSchema, memberJoinSchema, verifySchema } from "./validation";

describe("auth validation", () => {
  it("accepts a clean member join", () => {
    const result = memberJoinSchema.safeParse({ name: "Ada", email: "ada@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects a short artist intent", () => {
    const result = artistJoinSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      handle: "ada",
      medium: "Musicians",
      intent: "hi",
    });
    expect(result.success).toBe(false);
  });

  it("requires a verify code", () => {
    expect(verifySchema.safeParse({ email: "ada@example.com", code: "12" }).success).toBe(false);
    expect(verifySchema.safeParse({ email: "ada@example.com", code: "123456" }).success).toBe(true);
  });

  it("caps compose tags at 8", () => {
    const result = composePostSchema.safeParse({
      title: "Night piece",
      tags: ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
      visibility: "DRAFT",
    });
    expect(result.success).toBe(false);
  });
});
