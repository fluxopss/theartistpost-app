/// <reference types="jest" />
import { inlineEditReducer, inlineSaveValue, type InlineEditState } from "./inline-edit";

const idle: InlineEditState = { status: "idle" };

describe("inlineEditReducer", () => {
  it("starts editing with the current value as the draft", () => {
    expect(inlineEditReducer(idle, { type: "start", value: "Muralist" })).toEqual({
      status: "editing",
      draft: "Muralist",
      error: null,
    });
  });

  it("tracks typing", () => {
    const editing = inlineEditReducer(idle, { type: "start", value: "" });
    expect(inlineEditReducer(editing, { type: "change", text: "Poet" })).toEqual({
      status: "editing",
      draft: "Poet",
      error: null,
    });
  });

  it("moves to saving and keeps the draft", () => {
    const editing: InlineEditState = { status: "editing", draft: "Poet", error: "old error" };
    expect(inlineEditReducer(editing, { type: "submit" })).toEqual({ status: "saving", draft: "Poet" });
  });

  it("never loses what was typed when a save fails: back to editing with the same draft and the message", () => {
    const saving: InlineEditState = { status: "saving", draft: "A long bio I typed" };
    expect(inlineEditReducer(saving, { type: "failed", message: "You are offline." })).toEqual({
      status: "editing",
      draft: "A long bio I typed",
      error: "You are offline.",
    });
  });

  it("returns to idle after a successful save", () => {
    const saving: InlineEditState = { status: "saving", draft: "Poet" };
    expect(inlineEditReducer(saving, { type: "saved" })).toEqual(idle);
  });

  it("clears the error as soon as the person types again", () => {
    const failed: InlineEditState = { status: "editing", draft: "Poet", error: "Could not save." };
    expect(inlineEditReducer(failed, { type: "change", text: "Poets" })).toEqual({
      status: "editing",
      draft: "Poets",
      error: null,
    });
  });

  it("ignores typing and cancel while a save is in flight", () => {
    const saving: InlineEditState = { status: "saving", draft: "Poet" };
    expect(inlineEditReducer(saving, { type: "change", text: "x" })).toBe(saving);
    expect(inlineEditReducer(saving, { type: "cancel" })).toBe(saving);
  });

  it("cancel drops the draft", () => {
    const editing: InlineEditState = { status: "editing", draft: "Poet", error: null };
    expect(inlineEditReducer(editing, { type: "cancel" })).toEqual(idle);
  });

  it("ignores a stray start while already editing so the draft is not overwritten", () => {
    const editing: InlineEditState = { status: "editing", draft: "typed", error: null };
    expect(inlineEditReducer(editing, { type: "start", value: "server value" })).toBe(editing);
  });
});

describe("inlineSaveValue", () => {
  it("is unchanged when the trimmed draft equals the saved value", () => {
    expect(inlineSaveValue("  Poet ", "Poet", 80)).toEqual({ kind: "unchanged" });
    expect(inlineSaveValue("", null, 80)).toEqual({ kind: "unchanged" });
  });

  it("rejects a draft over the limit and names the limit", () => {
    const result = inlineSaveValue("x".repeat(85), "Poet", 80);
    expect(result.kind).toBe("invalid");
    if (result.kind === "invalid") expect(result.message).toContain("80");
  });

  it("saves null when the field is cleared", () => {
    expect(inlineSaveValue("   ", "Poet", 80)).toEqual({ kind: "save", value: null });
  });

  it("saves the trimmed value otherwise", () => {
    expect(inlineSaveValue("  Muralist  ", "Poet", 80)).toEqual({ kind: "save", value: "Muralist" });
  });
});
