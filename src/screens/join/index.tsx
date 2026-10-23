import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ScreenScroll } from "@/components/screen-scroll";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { houseGenres } from "@/content/stage";
import { artistJoinSchema, memberJoinSchema, verifySchema } from "@/domain/auth/validation";
import { isHouseCodeComplete, normalizeOtp, resendSecondsLeft } from "@/domain/auth/code";
import { radius, spacing, spark, stageGlow, stageLine, stageNavy, useBrandColors } from "@/theme";

/** `start` is the member form; it is the front door, so most people never see another screen. */
type JoinDoor = "start" | "artist" | "verify";

const MEDIUMS = houseGenres.map((g) => g.label);
const RESEND_COOLDOWN_MS = 30_000;

/**
 * Passwordless join. The first screen is the member form (name and email);
 * "I already joined" and "Request a studio" sit right under it. Returning
 * sign-in is an emailed six-digit code that autofills and submits itself.
 */
export function JoinScreen() {
  const palette = useBrandColors();
  const auth = useAuth();
  const [door, setDoor] = useState<JoinDoor>("start");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [useHouseCode, setUseHouseCode] = useState(!auth.supabaseReady);
  // Set once an account is made so the "already in the house" view never flashes before Welcome.
  const [leaving, setLeaving] = useState(false);

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [artistName, setArtistName] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [medium, setMedium] = useState(MEDIUMS[0] ?? "Musicians");
  const [intent, setIntent] = useState("");

  const [verifyEmail, setVerifyEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const submittedCode = useRef<string | null>(null);
  const codeSent = sentAt !== null;

  // Tick once a second while a code is out, for the resend countdown.
  useEffect(() => {
    if (!codeSent) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [codeSent]);

  // The house code is six digits: submit the moment the sixth one lands (typed, pasted or autofilled).
  useEffect(() => {
    if (!codeSent || !useHouseCode || busy) return;
    if (!isHouseCodeComplete(code) || submittedCode.current === code) return;
    submittedCode.current = code;
    void submitVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, codeSent, useHouseCode, busy]);

  if (auth.user && door === "start" && !leaving) {
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

  const goToSignIn = (email: string, message: string | null) => {
    setVerifyEmail(email);
    setCode("");
    setSentAt(null);
    submittedCode.current = null;
    setUseHouseCode(!auth.supabaseReady);
    setNotice(message);
    setError(null);
    setDoor("verify");
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
      if (result.existingEmail) {
        goToSignIn(parsed.data.email, "You have joined before. We will email you a code to sign back in.");
        return;
      }
      setError(result.error);
      return;
    }
    setLeaving(true);
    // New members go straight to Welcome: Guidelines, profile, topics.
    router.replace("/welcome");
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
      if (result.existingEmail) {
        goToSignIn(parsed.data.email, "You have joined before. We will email you a code to sign back in.");
        return;
      }
      setError(result.error);
      return;
    }
    setLeaving(true);
    router.replace("/welcome");
  };

  const sendCode = async () => {
    const email = verifyEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Enter the email you joined with.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const result =
      !useHouseCode && auth.supabaseReady ? await auth.requestSupabaseCode(email) : await auth.requestCode(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCode("");
    submittedCode.current = null;
    setNow(Date.now());
    setSentAt(Date.now());
  };

  async function submitVerify() {
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
          setSentAt(null);
          setCode("");
        }
        return;
      }
      setLeaving(true);
      router.replace("/welcome");
      return;
    }
    const result = await auth.verify(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLeaving(true);
    // Welcome checks the profile and goes straight on to the app when nothing is left to do.
    router.replace("/welcome");
  }

  const resendIn = resendSecondsLeft(sentAt, now, RESEND_COOLDOWN_MS);

  return (
    <ScreenScroll>
      {door === "start" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro
            kicker="Join the house"
            title="Welcome to The Artist Post"
            body="Free for every artist and neighbor. Just your name and email. No password, ever."
          />
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
            returnKeyType="go"
            onSubmitEditing={() => void submitMember()}
          />
          <Button title="Join as a member" tone="coral" size="lg" loading={busy} onPress={() => void submitMember()} />
          <View style={{ gap: spacing.xs, paddingTop: spacing.sm }}>
            <Button
              title="I already joined. Email me a code"
              variant="secondary"
              onPress={() => goToSignIn(memberEmail.trim(), null)}
            />
            <Button
              title="I am an artist. Request a studio"
              variant="ghost"
              onPress={() => {
                setError(null);
                setArtistName(memberName);
                setArtistEmail(memberEmail);
                setDoor("artist");
              }}
            />
          </View>
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
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
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
          <Button title="Back" variant="ghost" onPress={() => setDoor("start")} />
        </View>
      ) : null}

      {door === "verify" ? (
        <View style={{ gap: spacing.md }}>
          <StageIntro
            kicker="Welcome back"
            title="Sign in with a code"
            body={
              useHouseCode
                ? "We email a six-digit code to the address you joined with. No password."
                : "A code from Supabase Auth restores your pass; the house links it when `/auth/link` is live."
            }
          />
          {notice ? (
            <ThemedText variant="callout" tone="muted" accessibilityLiveRegion="polite">
              {notice}
            </ThemedText>
          ) : null}
          <TextField
            label="Email"
            value={verifyEmail}
            onChangeText={setVerifyEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!codeSent}
          />
          {codeSent ? (
            <>
              <TextField
                label="Code"
                value={code}
                onChangeText={(text) => setCode(normalizeOtp(text))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                maxLength={useHouseCode ? 6 : 8}
                helper="Check your email. It can take a minute. Pasting the code works."
                error={null}
              />
              <Button title="Sign in" tone="gold" loading={busy} onPress={() => void submitVerify()} />
              <Button
                title={resendIn > 0 ? `Send a new code in ${resendIn}s` : "Send a new code"}
                variant="secondary"
                disabled={resendIn > 0 || busy}
                onPress={() => void sendCode()}
              />
              <Button
                title="Use a different email"
                variant="ghost"
                onPress={() => {
                  setSentAt(null);
                  setCode("");
                  submittedCode.current = null;
                }}
              />
            </>
          ) : (
            <Button title="Email me a code" tone="gold" size="lg" loading={busy} onPress={() => void sendCode()} />
          )}
          {auth.supabaseReady && useHouseCode ? (
            <Button
              title="Try Supabase code instead"
              variant="ghost"
              onPress={() => {
                setUseHouseCode(false);
                setSentAt(null);
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
                setSentAt(null);
                setCode("");
                setError(null);
              }}
            />
          ) : null}
          <Button title="New here? Join the house" variant="ghost" onPress={() => setDoor("start")} />
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
