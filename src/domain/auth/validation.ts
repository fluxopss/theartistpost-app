import { z } from "zod";

export const memberJoinSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(80),
  email: z.string().trim().email("Enter a real email").max(200),
});

export const artistJoinSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(80),
  email: z.string().trim().email("Enter a real email").max(200),
  handle: z
    .string()
    .trim()
    .min(2, "Handle needs at least 2 characters")
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, "Handle must be letters, numbers, _ or -"),
  medium: z.string().trim().min(2).max(40),
  intent: z.string().trim().min(8, "Tell us a little more (8+ characters)").max(280),
});

export const verifySchema = z.object({
  email: z.string().trim().email("Enter a real email").max(200),
  code: z.string().trim().min(4, "Enter the code from your email").max(12),
});

export const composePostSchema = z.object({
  title: z.string().trim().min(2, "Title needs at least 2 characters").max(120),
  description: z.string().trim().max(4000).optional(),
  tags: z.array(z.string().trim().min(1)).max(8),
  visibility: z.enum(["DRAFT", "PUBLISHED"]),
});

export type MemberJoinValues = z.infer<typeof memberJoinSchema>;
export type ArtistJoinValues = z.infer<typeof artistJoinSchema>;
export type VerifyValues = z.infer<typeof verifySchema>;
export type ComposePostValues = z.infer<typeof composePostSchema>;
