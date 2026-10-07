import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ScreenScroll } from "@/components/screen-scroll";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { artistJoinSchema, memberJoinSchema, verifySchema } from "@/domain/auth/validation";
import { tapGenres } from "@/content/stage";
import { radius, spacing, spark, stageGlow, stageLine, stageNavy, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

type JoinDoor = "pick" | "member" | "artist" | "verify" | "done";

type DoneKind = "member" | "artist_pending" | "artist" | "return";

const MEDIUMS = tapGenres.map((g) => g.label);

/**
 * Passwordless join matching the web house doors: member, artist studio,
 * or return pass (house email code today; Supabase OTP when env is set).
 */
export function JoinScreen() {
  const palette = useBrandColors();
  const auth = useAuth();
  const [door, setDoor] = useState<JoinDoor>("pick");
  const [doneKind, setDoneKind] = useState<DoneKind>("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useHouseCode, setUseHouseCode] = useState(!auth.supabaseReady);

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [artistName, setArtistName] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [medium, setMedium] = useState(MEDIUMS[0] ?? "Musicians");
  const [intent, setIntent] = useState("");

  const [verifyEmail, setVerifyEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  if (auth.user && door === "pick") {
    return (
      <ScreenScroll>
        <StageIntro
          kicker="Already in the house"
          title={auth.user.name}
          body={
            auth.gate.kind === "artist_pending"
              ? "Your studio request is waiting on approval. Browse the house while Robbie reviews."
              : auth.canCompose
                ? "Your studio is open. Publish from the Studio tab when you have a piece ready."
                : "Your member pass is on this phone. Artist publish opens after approval."
          }
        />
        <Button title="Back to Studio" tone="teal" onPress={() => router.back()} />
        <Button title="Sign out" variant="destructive" onPress={() => void auth.signOut()} />
      </ScreenScroll>
    );
  }

  const finish = (kind: DoneKind) => {
    setDoneKind(kind);
    setDoor("done");
  };

  const submitMember = async () => {
    const parsed = memberJoinSchema.safeParse({ name: memberName, email: memberEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await auth.joinMember(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    finish("member");
  };

  const submitArtist = async () => {
    const parsed = artistJoinSchema.safeParse({
      name: artistName,
      email: artistEmail,
      handle,
      medium,
      intent,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await auth.joinArtist(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    finish(result.pendingApproval ? "artist_pending" : "artist");
  };

  const sendCode = async () => {
    const email = verifyEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Enter the email you joined with.");
      return;
    }
    setBusy(true);
    setError(null);
    if (!useHouseCode && auth.supabaseReady) {
      const result = await auth.requestSupabaseCode(email);
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCodeSent(true);
      return;
    }
    const result = await auth.requestCode(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCodeSent(true);
  };

  const submitVerify = async () => {
    const parsed = verifySchema.safeParse({ email: verifyEmail, code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the code");
      return;
    }
    setBusy(true);
    setError(null);
    if (!useHouseCode && auth.supabaseReady) {
      const result = await auth.verifySupabaseCode(parsed.data);
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        if (result.houseFallback) {
          setUseHouseCode(true);
          setCodeSent(false);
          setCode("");
        }
        return;
      }
      finish("return");
      return;
    }
    const result = await auth.verify(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    finish("return");
  };

  const doneCopy: Record<DoneKind, { kicker: string; title: string; body: string }> = {
    member: {
      kicker: "You’re in",
      title: "Member pass on this phone",
      body: "Like work, leave Wall notes, and RSVP with your pass. Artist publish opens after a studio request is approved.",
    },
    artist_pending: {
      kicker: "Studio requested",
      title: "Waiting on approval",
      body: "Browse the house while Robbie reviews. Nothing hits The Wall until you’re approved — that’s the trust lock.",
    },
    artist: {
      kicker: "Studio open",
      title: "Your pass can publish",
      body: "Head to Studio when you have a piece ready. The Wall only shows approved work.",
    },
    return: {
      kicker: "Welcome back",
      title: "Your pass is restored",
      body: "Likes and Wall notes use this phone’s pass. Pick up where you left off on The Wall.",
    },
  };

  return (
    <ScreenScroll>
      {door === "pick" ? (
        <>
          <StageIntro
            kicker="Join the house"
            title="Open a door"
            body="Passwordless — name and email for members, a short studio note for artists. No invented accounts."
          />
          <DoorPick
            title="Member"
            body="Browse, RSVP, and leave kindness with a pass on this phone."
            tone={spark.coral}
            onPress={() => {
              setError(null);
              setDoor("member");
            }}
          />
          <DoorPick
            title="Artist studio"
            body="Request a studio. Publish opens only after Robbie approves you."
            tone={spark.teal}
            onPress={() => {
              setError(null);
              setDoor("artist");
            }}
          />
          <DoorPick
            title="I already joined"
            body={
              auth.supabaseReady
                ? "Request an email code to restore your pass on this phone."
                : "Request an email code from the house to restore your pass."
            }
            tone={spark.gold}
            onPress={() => {
              setError(null);
              setUseHouseCode(!auth.supabaseReady);
              setCodeSent(false);
              setCode("");
              setDoor("verify");
            }}
          />
        </>
      ) : null}

      {door === "member" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro kicker="Member door" title="Join as a member" body="We open a viewer pass on this phone." />
          <TextField
            label="Name"
            value={memberName}
            onChangeText={setMemberName}
            autoComplete="name"
            textContentType="name"
            maxLength={80}
          />
          <TextField
            label="Email"
            value={memberEmail}
            onChangeText={setMemberEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={200}
          />
          <Button title="Open member door" tone="coral" loading={busy} onPress={() => void submitMember()} />
          <Button title="Back" variant="ghost" onPress={() => setDoor("pick")} />
        </View>
      ) : null}

      {door === "artist" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro
            kicker="Artist door"
            title="Request a studio"
            body="Approval is required before anything hits The Wall. Handles stay letters, numbers, _ or -."
          />
          <TextField label="Name" value={artistName} onChangeText={setArtistName} maxLength={80} textContentType="name" />
          <TextField
            label="Email"
            value={artistEmail}
            onChangeText={setArtistEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            maxLength={200}
          />
          <TextField
            label="Handle"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={40}
            helper="Shown on The Wall as @handle"
          />
          <View style={{ gap: spacing.xs }}>
            <ThemedText variant="subheadline">Medium</ThemedText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {MEDIUMS.map((label) => {
                const on = label === medium;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setMedium(label)}
                    style={{
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.pill,
                      borderCurve: "continuous",
                      backgroundColor: on ? spark.teal : palette.bgElevated,
                      borderWidth: 1,
                      borderColor: on ? spark.teal : palette.separatorStrong,
                    }}
                  >
                    <ThemedText variant="footnote" style={on ? { color: stageNavy } : undefined}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <TextField
            label="Why this house"
            value={intent}
            onChangeText={setIntent}
            multiline
            maxLength={280}
            showCount
            style={{ minHeight: 96, textAlignVertical: "top" }}
          />
          <Button title="Request studio" tone="teal" loading={busy} onPress={() => void submitArtist()} />
          <Button title="Back" variant="ghost" onPress={() => setDoor("pick")} />
        </View>
      ) : null}

      {door === "verify" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro
            kicker="Return pass"
            title="Email code"
            body={
              useHouseCode
                ? "We’ll send a short code to the email you joined with. If delivery isn’t configured yet, you’ll see an honest pause — never a fake login."
                : "A code from Supabase Auth restores your pass; the house links it when `/auth/link` is live."
            }
          />
          <TextField
            label="Email"
            value={verifyEmail}
            onChangeText={setVerifyEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          {codeSent ? (
            <TextField
              label="Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={12}
            />
          ) : null}
          <Button
            title={codeSent ? "Open with code" : "Send code"}
            tone="gold"
            loading={busy}
            onPress={() => void (codeSent ? submitVerify() : sendCode())}
          />
          {auth.supabaseReady && useHouseCode ? (
            <Button
              title="Try Supabase code instead"
              variant="ghost"
              onPress={() => {
                setUseHouseCode(false);
                setCodeSent(false);
                setCode("");
                setError(null);
              }}
            />
          ) : null}
          {auth.supabaseReady && !useHouseCode ? (
            <Button
              title="Use house email code"
              variant="ghost"
              onPress={() => {
                setUseHouseCode(true);
                setCodeSent(false);
                setCode("");
                setError(null);
              }}
            />
          ) : null}
          <Button title="Back" variant="ghost" onPress={() => setDoor("pick")} />
        </View>
      ) : null}

      {door === "done" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro
            kicker={doneCopy[doneKind].kicker}
            title={doneCopy[doneKind].title}
            body={doneCopy[doneKind].body}
          />
          <Button title="See The Wall" tone="coral" onPress={() => router.replace(tabRoutes.wall)} />
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      ) : null}

      {error ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
    </ScreenScroll>
  );
}

function StageIntro({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <View
      style={{
        backgroundColor: stageNavy,
        experimental_backgroundImage: stageGlow,
        borderRadius: radius.xl,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: stageLine,
        padding: spacing.lg,
        gap: spacing.xs,
        overflow: "hidden",
      }}
    >
      <ThemedText variant="eyebrow" style={{ color: spark.gold }}>
        {kicker}
      </ThemedText>
      <ThemedText variant="title1" tone="onStage">
        {title}
      </ThemedText>
      <ThemedText variant="callout" tone="onStageMuted">
        {body}
      </ThemedText>
    </View>
  );
}

function DoorPick({
  title,
  body,
  tone,
  onPress,
}: {
  title: string;
  body: string;
  tone: string;
  onPress: () => void;
}) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        gap: spacing.xxs,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
        borderWidth: 1,
        borderColor: palette.separator,
        borderLeftWidth: 3,
        borderLeftColor: tone,
      })}
    >
      <ThemedText variant="headline">{title}</ThemedText>
      <ThemedText variant="subheadline" tone="muted">
        {body}
      </ThemedText>
    </Pressable>
  );
}
