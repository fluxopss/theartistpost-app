/// <reference types="jest" />
import {
  BIO_MAX,
  buildProfilePatch,
  HEADLINE_MAX,
  LOCATION_MAX,
  TOPICS_MAX,
  validateProfileForm,
  type ProfileFormValues,
} from "./profile-form";

const original: ProfileFormValues = {
  name: "Robbi",
  handle: "robbi",
  headline: "Founder",
  location: "West Palm Beach",
  bio: "Hello",
  chapterId: "fl-wpb",
  topicSlugs: ["music", "dance"],
  venmoUsername: "",
  cashAppTag: "",
  paypalMeUsername: "",
};

describe("validateProfileForm", () => {
  it("accepts the original values", () => {
    expect(validateProfileForm(original, { handleLocked: false })).toEqual({ ok: true });
  });

  it("enforces the server's limits", () => {
    const check = (patch: Partial<ProfileFormValues>) =>
      validateProfileForm({ ...original, ...patch }, { handleLocked: false });
    expect(check({ name: "A" })).toMatchObject({ ok: false, fields: { name: expect.any(String) } });
    expect(check({ bio: "x".repeat(BIO_MAX + 1) })).toMatchObject({ ok: false, fields: { bio: expect.any(String) } });
    expect(check({ headline: "x".repeat(HEADLINE_MAX + 1) })).toMatchObject({
      ok: false,
      fields: { headline: expect.any(String) },
    });
    expect(check({ location: "x".repeat(LOCATION_MAX + 1) })).toMatchObject({
      ok: false,
      fields: { location: expect.any(String) },
    });
    expect(check({ topicSlugs: Array.from({ length: TOPICS_MAX + 1 }, (_, i) => `t${i}`) })).toMatchObject({
      ok: false,
      fields: { topicSlugs: expect.any(String) },
    });
    expect(check({ handle: "admin" })).toMatchObject({ ok: false, fields: { handle: expect.any(String) } });
    expect(check({ handle: "no spaces" })).toMatchObject({ ok: false, fields: { handle: expect.any(String) } });
  });

  it("does not validate the handle when it is locked (artists)", () => {
    expect(validateProfileForm({ ...original, handle: "ADMIN!" }, { handleLocked: true })).toEqual({ ok: true });
  });
});

describe("buildProfilePatch", () => {
  it("sends nothing when nothing changed", () => {
    expect(buildProfilePatch(original, original, { handleLocked: false })).toEqual({});
  });

  it("sends only changed fields, trimming text and lowercasing the handle", () => {
    expect(
      buildProfilePatch(
        original,
        { ...original, name: "  Robbi G ", handle: "Robbi_G", bio: "Hello there", headline: "Founder" },
        { handleLocked: false },
      ),
    ).toEqual({ name: "Robbi G", handle: "robbi_g", bio: "Hello there" });
  });

  it("turns cleared text into null and a cleared chapter into null", () => {
    expect(
      buildProfilePatch(
        original,
        { ...original, bio: "   ", headline: "", location: "", chapterId: null },
        { handleLocked: false },
      ),
    ).toEqual({ bio: null, headline: null, location: null, chapterId: null });
  });

  it("sends topics only when the set changed (order ignored)", () => {
    expect(
      buildProfilePatch(original, { ...original, topicSlugs: ["dance", "music"] }, { handleLocked: false }),
    ).toEqual({});
    expect(
      buildProfilePatch(original, { ...original, topicSlugs: ["music"] }, { handleLocked: false }),
    ).toEqual({ topicSlugs: ["music"] });
  });

  it("never sends the handle for a locked (artist) profile", () => {
    expect(
      buildProfilePatch(original, { ...original, handle: "newname", name: "New" }, { handleLocked: true }),
    ).toEqual({ name: "New" });
  });
});

describe("payment usernames in the profile form", () => {
  const artist = { handleLocked: true, paymentsEnabled: true } as const;

  it("validates only when the artist section is enabled", () => {
    const values = { ...original, venmoUsername: "no" };
    expect(validateProfileForm(values, { handleLocked: false })).toEqual({ ok: true });
    expect(validateProfileForm(values, artist)).toMatchObject({
      ok: false,
      fields: { venmoUsername: expect.stringMatching(/venmo/i) },
    });
  });

  it("reports each bad field under its own key", () => {
    const result = validateProfileForm(
      { ...original, venmoUsername: "no", cashAppTag: "1abc", paypalMeUsername: "a b" },
      artist,
    );
    expect(result).toMatchObject({
      ok: false,
      fields: {
        venmoUsername: expect.any(String),
        cashAppTag: expect.any(String),
        paypalMeUsername: expect.any(String),
      },
    });
  });

  it("accepts pasted links and prefixes", () => {
    expect(
      validateProfileForm(
        {
          ...original,
          venmoUsername: "https://venmo.com/u/robbie-art",
          cashAppTag: "$robbieart",
          paypalMeUsername: "paypal.me/robbieart",
        },
        artist,
      ),
    ).toEqual({ ok: true });
  });

  it("sends the cleaned name, and null when cleared", () => {
    expect(
      buildProfilePatch(
        original,
        { ...original, venmoUsername: "@robbie-art", cashAppTag: "https://cash.app/$robbieart" },
        artist,
      ),
    ).toEqual({ venmoUsername: "robbie-art", cashAppTag: "robbieart" });

    const saved = { ...original, venmoUsername: "robbie-art", cashAppTag: "robbieart" };
    expect(buildProfilePatch(saved, { ...saved, venmoUsername: "", cashAppTag: "  " }, artist)).toEqual({
      venmoUsername: null,
      cashAppTag: null,
    });
  });

  it("sends nothing when the cleaned value is unchanged", () => {
    const saved = { ...original, venmoUsername: "robbie-art" };
    expect(buildProfilePatch(saved, { ...saved, venmoUsername: "@robbie-art" }, artist)).toEqual({});
  });

  it("never sends payment fields for members", () => {
    expect(
      buildProfilePatch(original, { ...original, venmoUsername: "robbie-art" }, { handleLocked: false }),
    ).toEqual({});
  });
});
