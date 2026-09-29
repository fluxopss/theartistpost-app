import { type Href, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

import { links, site } from "@/content/site";

/**
 * Tab roots live in the shared array-group stack, so a bare "/wall" pushed
 * from Home would stack the Wall *inside* Home. Tab roots always switch tabs
 * via their full group path; everything else pushes within the current tab.
 */
export const tabRoutes = {
  home: "/(tabs)/(home)",
  wall: "/(tabs)/(wall)/wall",
  schedule: "/(tabs)/(schedule)/schedule",
  kindness: "/(tabs)/(kindness)/kindness",
  studio: "/(tabs)/(studio)/studio",
} as const;

const webToNative: Record<string, Href> = {
  "/": tabRoutes.home,
  "/explore": tabRoutes.wall,
  "/artist-schedule": tabRoutes.schedule,
  "/kindness-always": tabRoutes.kindness,
  "/more": tabRoutes.studio,
  "/night": "/night",
  "/get-involved": "/get-involved",
  "/about": "/about",
  "/history": "/history",
  "/supporters": "/supporters",
  "/donate": "/donate",
};

/** Donation pages must open in the system browser, not an in-app view. */
const SYSTEM_BROWSER_HOSTS = ["paypal.com", "venmo.com"];

export async function openExternal(url: string) {
  if (/^(mailto|tel|sms|maps):/i.test(url) || SYSTEM_BROWSER_HOSTS.some((h) => url.includes(h))) {
    await Linking.openURL(url);
    return;
  }
  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}

/** Follow a content href from the web copy: native route, or external. */
export function followHref(href: string) {
  if (/^[a-z]+:/i.test(href)) {
    void openExternal(href);
    return;
  }
  const [path] = href.split("?");
  const eventMatch = path.match(/^\/event\/(.+)$/);
  if (eventMatch) {
    router.push({ pathname: "/event/[id]", params: { id: eventMatch[1] } });
    return;
  }
  const target = webToNative[path];
  if (!target) return;
  if (typeof target === "string" && target.startsWith("/(tabs)")) router.navigate(target);
  else router.push(target);
}

export const contact = {
  call: () => Linking.openURL(`tel:${site.phoneTel}`),
  email: (subject?: string) =>
    Linking.openURL(`mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`),
  directions: () => {
    const q = encodeURIComponent(site.address.full);
    const url = process.env.EXPO_OS === "ios" ? `maps:0,0?q=${q}` : `geo:0,0?q=${q}`;
    Linking.openURL(url).catch(() => Linking.openURL(site.mapsUrl));
  },
  /** In-app donate story — PayPal opens from that screen via system browser. */
  donate: () => {
    router.push("/donate");
  },
  paypalOnce: () => Linking.openURL(links.donate),
  paypalMonthly: () => Linking.openURL(links.donateMonthly),
  merch: () => void openExternal(links.merch),
};
