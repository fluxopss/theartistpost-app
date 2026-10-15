import type { AdminPersonRowDTO, AdminRole } from "@/api/types";

/** Reason length the server enforces (3–200 characters after trimming). */
export const REASON_MIN = 3;
export const REASON_MAX = 200;

const ROLE_LABEL: Record<AdminRole, string> = {
  VIEWER: "Member",
  ARTIST: "Artist",
  ADMIN: "Admin",
};

export function roleLabel(role: AdminRole): string {
  return ROLE_LABEL[role];
}

export type PeopleFilters = {
  q: string;
  role: AdminRole | "all";
  status: "all" | "active" | "suspended";
  pendingArtist: boolean;
};

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
  q: "",
  role: "all",
  status: "all",
  pendingArtist: false,
};

/** Query-string params for GET /admin/users; omits anything left at its default. */
export function peopleQueryParams(filters: PeopleFilters): Record<string, string> {
  const params: Record<string, string> = {};
  const q = filters.q.trim();
  if (q) params.q = q;
  if (filters.role !== "all") params.role = filters.role;
  if (filters.status !== "all") params.status = filters.status;
  if (filters.pendingArtist) params.pendingArtist = "1";
  return params;
}

/** Null when the reason is acceptable, otherwise a plain sentence for the field. */
export function reasonProblem(raw: string): string | null {
  const text = raw.trim();
  if (text.length === 0) return "Say why. It goes in the audit history.";
  if (text.length < REASON_MIN) return "Say why, in a few words.";
  if (text.length > REASON_MAX) return `Make it shorter (up to ${REASON_MAX} characters).`;
  return null;
}

export type PersonActionId =
  | "approve_artist"
  | "revoke_artist"
  | "suspend"
  | "unsuspend"
  | "sign_in_help"
  | `role:${AdminRole}`;

export type PersonActionOption = {
  id: PersonActionId;
  label: string;
  /** What the confirmation says will happen, in plain words. */
  consequence: string;
  destructive: boolean;
};

const ROLE_ACTION: Record<AdminRole, { label: string; consequence: string }> = {
  VIEWER: {
    label: "Make a member",
    consequence: "They lose artist and admin tools and become a regular member.",
  },
  ARTIST: {
    label: "Make an artist",
    consequence: "They get the artist role. Approval to publish is separate.",
  },
  ADMIN: {
    label: "Make an admin",
    consequence: "They can manage people, reports and artist requests.",
  },
};

/**
 * The actions worth offering for this person. Mirrors the server guards so
 * nobody is shown a button that is guaranteed to fail; the server still
 * decides.
 */
export function actionsFor(person: AdminPersonRowDTO, viewerId: string): PersonActionOption[] {
  // Reserved seed identities are not managed here.
  if (person.deniedSeed) return [];

  const options: PersonActionOption[] = [];
  const isSelf = person.id === viewerId;
  const isAdmin = person.role === "ADMIN";
  const hasProfile = person.artistApproved !== null;

  if (person.artistApproved === false) {
    options.push({
      id: "approve_artist",
      label: "Approve as artist",
      consequence: "They can publish to The Wall.",
      destructive: false,
    });
  } else if (person.artistApproved === true) {
    options.push({
      id: "revoke_artist",
      label: "Revoke artist approval",
      consequence: "They can no longer publish to The Wall until approved again.",
      destructive: true,
    });
  }

  // You can never take away your own admin role.
  if (!(isSelf && isAdmin)) {
    for (const role of ["VIEWER", "ARTIST", "ADMIN"] as const) {
      if (role === person.role) continue;
      if (role === "ARTIST" && !hasProfile) continue;
      options.push({
        id: `role:${role}`,
        label: ROLE_ACTION[role].label,
        consequence: ROLE_ACTION[role].consequence,
        destructive: person.role === "ADMIN" && role !== "ADMIN",
      });
    }
  }

  if (person.suspended) {
    options.push({
      id: "unsuspend",
      label: "Lift suspension",
      consequence: "They can post, comment and react again.",
      destructive: false,
    });
  } else if (!isSelf && !isAdmin) {
    options.push({
      id: "suspend",
      label: "Suspend",
      consequence: "They can still read, but can't post, comment or react.",
      destructive: true,
    });
  }

  options.push({
    id: "sign_in_help",
    label: "Email a sign-in code",
    consequence: "A one-time code goes to their email. You never see it.",
    destructive: false,
  });

  return options;
}

const AUDIT_LABEL: Record<string, string> = {
  "user.role_change": "Role changed",
  "user.suspend": "Suspended",
  "user.unsuspend": "Suspension lifted",
  "user.sign_in_help": "Sign-in code emailed",
  "artist.approve": "Approved as artist",
  "artist.revoke": "Artist approval revoked",
  "moderation.suspend_user": "Suspended from the queue",
  "moderation.hide": "Content hidden",
  "moderation.dismiss": "Reports dismissed",
};

export function auditLabel(action: string): string {
  return AUDIT_LABEL[action] ?? action.replace(/[._]/g, " ");
}
