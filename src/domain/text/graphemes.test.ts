/// <reference types="jest" />
import { graphemeCount, truncateGraphemes } from "./graphemes";

describe("graphemeCount", () => {
  it("counts plain text by character", () => {
    expect(graphemeCount("")).toBe(0);
    expect(graphemeCount("hello")).toBe(5);
  });

  it("counts an emoji as one character, not two code units", () => {
    expect(graphemeCount("🎨")).toBe(1);
    expect("🎨".length).toBe(2);
    expect(graphemeCount("🎨🔥👏")).toBe(3);
  });

  it("keeps variation selectors, skin tones, keycaps and flags together", () => {
    expect(graphemeCount("❤️")).toBe(1);
    expect(graphemeCount("👍🏽")).toBe(1);
    expect(graphemeCount("1️⃣")).toBe(1);
    expect(graphemeCount("🇺🇸")).toBe(1);
    expect(graphemeCount("🇺🇸🇫🇷")).toBe(2);
  });

  it("keeps ZWJ sequences and combining marks together", () => {
    expect(graphemeCount("👨‍👩‍👧‍👦")).toBe(1);
    expect(graphemeCount("🏳️‍🌈")).toBe(1);
    expect(graphemeCount("é")).toBe(1);
    expect(graphemeCount("a\r\nb")).toBe(3);
  });

  it("500 emoji are 500 characters (the composer limit), 501 are not", () => {
    expect(graphemeCount("🎨".repeat(500))).toBe(500);
    expect(graphemeCount("🎨".repeat(501))).toBe(501);
  });
});

describe("truncateGraphemes", () => {
  it("never cuts an emoji in half", () => {
    expect(truncateGraphemes("ab👨‍👩‍👧‍👦cd", 3)).toBe("ab👨‍👩‍👧‍👦");
    expect(truncateGraphemes("hello", 10)).toBe("hello");
  });
});
