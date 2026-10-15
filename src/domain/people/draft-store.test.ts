/// <reference types="jest" />
import { clearProfileDraft, readProfileDraft, rememberProfileDraft } from "./draft-store";
import type { ProfileFormValues } from "./profile-form";

const values: ProfileFormValues = {
  name: "Vera",
  handle: "vera",
  headline: "Poet",
  location: "",
  bio: "Typed but never saved",
  chapterId: null,
  topicSlugs: ["music"],
};

afterEach(() => {
  clearProfileDraft("user_a");
  clearProfileDraft("user_b");
});

describe("profile draft store", () => {
  it("returns nothing when no draft was kept", () => {
    expect(readProfileDraft("user_a")).toBeNull();
  });

  it("keeps an unsaved edit so closing the sheet does not lose it", () => {
    rememberProfileDraft("user_a", values);
    expect(readProfileDraft("user_a")).toEqual(values);
  });

  it("keeps drafts per person, so a second account never sees the first one's text", () => {
    rememberProfileDraft("user_a", values);
    expect(readProfileDraft("user_b")).toBeNull();
  });

  it("forgets the draft once it is saved", () => {
    rememberProfileDraft("user_a", values);
    clearProfileDraft("user_a");
    expect(readProfileDraft("user_a")).toBeNull();
  });

  it("hands back a copy, so editing it does not rewrite the stored draft", () => {
    rememberProfileDraft("user_a", values);
    const read = readProfileDraft("user_a");
    read!.topicSlugs.push("film");
    expect(readProfileDraft("user_a")?.topicSlugs).toEqual(["music"]);
  });
});
