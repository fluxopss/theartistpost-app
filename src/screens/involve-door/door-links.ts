import { router } from "expo-router";

import type { IconName } from "@/components/icon";
import type { InvolveDoorLink } from "@/content/involve";
import { links } from "@/content/site";
import { contact, followHref, tabRoutes } from "@/utils/links";

/** Follow a door's web-copy link: native route, system mail, or browser. */
export function openDoorLink(link: InvolveDoorLink) {
  if (link.href === links.donate) {
    void contact.donate();
    return;
  }
  if (link.href === "/artist-schedule") {
    router.navigate(tabRoutes.schedule);
    return;
  }
  followHref(link.href);
}

/** A leading glyph that says where the link goes, not just that it's a link. */
export function doorLinkIcon(link: InvolveDoorLink): IconName {
  if (link.href.startsWith("mailto:")) return "email";
  if (link.href === links.artistAgreement) return "pencil";
  if (link.href === links.donate) return "donate";
  switch (link.href) {
    case "/artist-schedule":
      return "schedule";
    case "/supporters":
      return "people";
    case "/kindness-always":
      return "kindness";
    case "/night":
      return "ticket";
    default:
      return link.external ? "external" : "arrowRight";
  }
}
