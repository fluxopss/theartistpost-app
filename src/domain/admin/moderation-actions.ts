import type { ReportAction, ReportTargetType } from "@/api/types";

/**
 * The actions an admin may take on a report. Profile reports cannot be hidden:
 * the server rejects Hide on USER and says to suspend instead.
 */
export function moderationActionsFor(targetType: ReportTargetType): ReportAction[] {
  if (targetType === "USER") return ["suspend_user", "dismiss"];
  return ["hide", "dismiss", "suspend_user"];
}
