/// <reference types="jest" />
import { HOUSE_CODE_LENGTH, isHouseCodeComplete, normalizeOtp, resendSecondsLeft } from "./code";

describe("normalizeOtp", () => {
  it("keeps digits only, so a pasted '123 456' or '123-456' works", () => {
    expect(normalizeOtp("123 456")).toBe("123456");
    expect(normalizeOtp("123-456")).toBe("123456");
    expect(normalizeOtp(" 12a3b4c5d6 ")).toBe("123456");
  });

  it("cuts to eight digits so a pasted email sentence cannot overflow the field", () => {
    expect(normalizeOtp("Your code is 123456 and expires in 10 minutes")).toBe("12345610");
  });

  it("is empty for text with no digits", () => {
    expect(normalizeOtp("abc")).toBe("");
  });
});

describe("isHouseCodeComplete", () => {
  it("is true at exactly six digits", () => {
    expect(HOUSE_CODE_LENGTH).toBe(6);
    expect(isHouseCodeComplete("123456")).toBe(true);
    expect(isHouseCodeComplete("12345")).toBe(false);
    expect(isHouseCodeComplete("1234567")).toBe(false);
  });
});

describe("resendSecondsLeft", () => {
  it("counts down from the cooldown and never goes below zero", () => {
    expect(resendSecondsLeft(1_000, 1_000, 30_000)).toBe(30);
    expect(resendSecondsLeft(1_000, 1_001, 30_000)).toBe(30);
    expect(resendSecondsLeft(1_000, 16_000, 30_000)).toBe(15);
    expect(resendSecondsLeft(1_000, 31_000, 30_000)).toBe(0);
    expect(resendSecondsLeft(1_000, 99_000, 30_000)).toBe(0);
  });

  it("is zero when no code has been sent yet", () => {
    expect(resendSecondsLeft(null, 5_000, 30_000)).toBe(0);
  });
});
