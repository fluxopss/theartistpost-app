import { View } from "react-native";

import type { PostSummaryDTO } from "@/api/types";
import { PostTile } from "@/components/post-tile";
import { spacing } from "@/theme";

const COLUMNS = 2;

function rowsOf<T>(items: readonly T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += COLUMNS) rows.push(items.slice(i, i + COLUMNS));
  return rows;
}

/**
 * Works in two columns. Without `posts` it shows `loadingCount` tile-shaped
 * placeholders instead — the same grid, still loading.
 */
export function PostGrid({
  posts,
  loadingCount = 4,
}: {
  posts?: readonly PostSummaryDTO[];
  loadingCount?: number;
}) {
  const loading = !posts;
  const cells: (PostSummaryDTO | number)[] = posts
    ? [...posts]
    : Array.from({ length: loadingCount }, (_, i) => i);

  return (
    <View
      accessible={loading}
      accessibilityLabel={loading ? "Loading work" : undefined}
      style={{ gap: spacing.lg }}
    >
      {rowsOf(cells).map((row) => (
        <View
          key={typeof row[0] === "number" ? `loading-${row[0]}` : row[0].id}
          style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}
        >
          {row.map((cell) =>
            typeof cell === "number" ? (
              <PostTile key={`loading-${cell}`} style={{ flex: 1 }} />
            ) : (
              <PostTile key={cell.id} post={cell} style={{ flex: 1 }} />
            ),
          )}
          {row.length < COLUMNS ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}
