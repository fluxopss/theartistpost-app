/// <reference types="jest" />
import { profileShareMessage, profileShareUrl } from "./share";

describe("profile sharing", () => {
  it("builds the public profile link on the live site, whatever API the app talks to", () => {
    expect(profileShareUrl("robbi")).toBe("https://theartistpost.fluxlab.agency/u/robbi");
    expect(profileShareUrl("Jo_E-1")).toBe("https://theartistpost.fluxlab.agency/u/jo_e-1");
  });

  it("writes a short share message with the link", () => {
    expect(profileShareMessage("Robbi", "robbi")).toBe(
      "Robbi on The Artist Post: https://theartistpost.fluxlab.agency/u/robbi",
    );
  });
});
