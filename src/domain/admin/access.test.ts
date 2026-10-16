/// <reference types="jest" />
import { isHouseAdmin } from "./access";

describe("isHouseAdmin", () => {
  it("is true only for a signed-in account the server marked admin", () => {
    expect(isHouseAdmin(true, { admin: true })).toBe(true);
  });

  it("is false for a signed-in non-admin", () => {
    expect(isHouseAdmin(true, { admin: false })).toBe(false);
  });

  it("is false when signed out, even if an admin's permissions are still cached", () => {
    expect(isHouseAdmin(false, { admin: true })).toBe(false);
  });

  it("is false while permissions are unknown", () => {
    expect(isHouseAdmin(true, undefined)).toBe(false);
    expect(isHouseAdmin(true, null)).toBe(false);
  });
});
