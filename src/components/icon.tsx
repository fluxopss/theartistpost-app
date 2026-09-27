import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

type MaterialName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * One icon vocabulary, two native families: SF Symbols on iOS, Material on
 * Android. Add names here — never pass raw SF names from screens.
 */
export const iconMap = {
  home: { sf: "house", md: "home" },
  wall: { sf: "safari", md: "explore" },
  schedule: { sf: "calendar", md: "calendar-month" },
  kindness: { sf: "sparkles", md: "auto-awesome" },
  studio: { sf: "person.crop.circle", md: "account-circle" },
  heart: { sf: "heart", md: "favorite-border" },
  heartFill: { sf: "heart.fill", md: "favorite" },
  donate: { sf: "heart.circle", md: "volunteer-activism" },
  bookmark: { sf: "bookmark", md: "bookmark-border" },
  bookmarkFill: { sf: "bookmark.fill", md: "bookmark" },
  share: { sf: "square.and.arrow.up", md: "ios-share" },
  calendarAdd: { sf: "calendar.badge.plus", md: "event" },
  ticket: { sf: "ticket", md: "confirmation-number" },
  door: { sf: "door.left.hand.open", md: "meeting-room" },
  mapPin: { sf: "mappin.and.ellipse", md: "place" },
  directions: { sf: "arrow.triangle.turn.up.right.diamond", md: "directions" },
  phone: { sf: "phone", md: "call" },
  email: { sf: "envelope", md: "mail-outline" },
  clock: { sf: "clock", md: "schedule" },
  chevronRight: { sf: "chevron.right", md: "chevron-right" },
  chevronLeft: { sf: "chevron.left", md: "chevron-left" },
  arrowRight: { sf: "arrow.right", md: "arrow-forward" },
  arrowDown: { sf: "arrow.down", md: "arrow-downward" },
  close: { sf: "xmark", md: "close" },
  check: { sf: "checkmark", md: "check" },
  checkCircle: { sf: "checkmark.circle.fill", md: "check-circle" },
  warning: { sf: "exclamationmark.triangle", md: "warning-amber" },
  info: { sf: "info.circle", md: "info-outline" },
  filters: { sf: "line.3.horizontal.decrease.circle", md: "filter-list" },
  search: { sf: "magnifyingglass", md: "search" },
  settings: { sf: "gearshape", md: "settings" },
  history: { sf: "clock.arrow.circlepath", md: "history" },
  people: { sf: "person.2", md: "groups" },
  music: { sf: "music.note", md: "music-note" },
  photo: { sf: "camera", md: "photo-camera" },
  pencil: { sf: "pencil", md: "edit" },
  trash: { sf: "trash", md: "delete-outline" },
  flag: { sf: "flag", md: "outlined-flag" },
  block: { sf: "nosign", md: "block" },
  refresh: { sf: "arrow.clockwise", md: "refresh" },
  plus: { sf: "plus", md: "add" },
  external: { sf: "arrow.up.right.square", md: "open-in-new" },
  sparkle: { sf: "sparkle", md: "auto-awesome" },
  wifiOff: { sf: "wifi.slash", md: "wifi-off" },
} as const satisfies Record<
  string,
  { sf: SymbolViewProps["name"]; md: MaterialName }
>;

export type IconName = keyof typeof iconMap;

export function Icon({
  name,
  size = 20,
  color,
  weight = "regular",
  style,
}: {
  name: IconName;
  size?: number;
  color: ColorValue;
  weight?: SymbolViewProps["weight"];
  style?: StyleProp<ViewStyle>;
}) {
  const glyph = iconMap[name];

  if (process.env.EXPO_OS === "ios") {
    return (
      <SymbolView
        name={glyph.sf}
        size={size}
        weight={weight}
        tintColor={color as string}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  }

  return (
    <MaterialIcons
      name={glyph.md}
      size={size}
      color={color}
      style={style as never}
    />
  );
}
