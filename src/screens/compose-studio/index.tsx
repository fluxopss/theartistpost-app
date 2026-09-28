import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { useAuth, studioApi, displayHandle } from "@/auth";
import { isApiError } from "@/api/errors";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { composePostSchema } from "@/domain/auth/validation";
import { radius, spacing, useBrandColors } from "@/theme";

/**
 * Artist media compose — pick image, caption, tags, draft or publish.
 * Talks to `/api/v1/studio/*`; fails honestly when the house API is not live.
 */
export function ComposeStudioScreen() {
  const palette = useBrandColors();
  const { canCompose, user, gate } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [fileName, setFileName] = useState("piece.jpg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ slug: string; status: string } | null>(null);

  const tags = useMemo(
    () =>
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
    [tagsRaw],
  );

  if (!canCompose) {
    const body =
      gate.kind === "artist_pending"
        ? "Your studio request is still waiting on approval. Media publish stays closed until then."
        : "Only an approved artist can put work on The Wall from this phone.";
    return (
      <>
        <Stack.Screen options={{ title: "New piece" }} />
        <ScreenScroll>
          <EmptyState
            icon="studio"
            title="Studio publish is closed"
            body={body}
            action={<Button title="Back" variant="secondary" onPress={() => router.back()} />}
          />
        </ScreenScroll>
      </>
    );
  }

  const pickMedia = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setLocalUri(asset.uri);
    setMimeType(asset.mimeType ?? "image/jpeg");
    setFileName(asset.fileName ?? `piece-${Date.now()}.jpg`);
  };

  const submit = async (visibility: "DRAFT" | "PUBLISHED") => {
    const parsed = composePostSchema.safeParse({
      title,
      description: description.trim() || undefined,
      tags,
      visibility,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the piece details");
      return;
    }
    if (!localUri) {
      setError("Pick a photograph first — the Wall stays visual.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const uploaded = await studioApi.uploadMedia({
        uri: localUri,
        name: fileName,
        mimeType,
      });
      const created = await studioApi.createPost({
        title: parsed.data.title,
        caption: parsed.data.description,
        tags: parsed.data.tags,
        visibility: parsed.data.visibility,
        mediaUrl: uploaded.url,
        mediaType: uploaded.mediaType,
      });
      setDone({ slug: created.slug, status: created.status });
    } catch (cause) {
      if (isApiError(cause)) {
        if (cause.code === "not_found" || cause.status === 404) {
          setError(
            "The studio publish API is not on the house yet. Your piece was not uploaded as a fake success.",
          );
        } else if (cause.offline) {
          setError("Couldn't reach The Artist Post. Try again when you're online.");
        } else {
          setError(cause.message);
        }
      } else {
        setError("Could not save this piece.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <Stack.Screen options={{ title: "Saved" }} />
        <ScreenScroll>
          <EmptyState
            icon="checkCircle"
            title={done.status === "PUBLISHED" ? "On The Wall" : "Draft saved"}
            body={
              done.status === "PUBLISHED"
                ? `Published as ${done.slug}. It will show on The Wall once the house serves it.`
                : `Draft ${done.slug} is with the house. Publish when you're ready.`
            }
            action={
              <View style={{ gap: spacing.sm }}>
                {done.status === "PUBLISHED" ? (
                  <Button
                    title="View on The Wall"
                    tone="teal"
                    onPress={() => router.replace({ pathname: "/post/[slug]", params: { slug: done.slug } })}
                  />
                ) : null}
                <Button title="Back to Studio" variant="secondary" onPress={() => router.back()} />
              </View>
            }
          />
        </ScreenScroll>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "New piece" }} />
      <ScreenScroll>
        <View style={{ gap: spacing.xxs }}>
          <ThemedText variant="eyebrow" tone="spark-teal">
            {displayHandle(user) ? `@${displayHandle(user)}` : user?.name}
          </ThemedText>
          <ThemedText variant="title2" accessibilityRole="header">
            Put a piece on the stage
          </ThemedText>
          <ThemedText variant="body" tone="muted">
            Photograph first. Caption and tags second. Draft by default — publish only when you mean it.
          </ThemedText>
        </View>

        <View style={{ gap: spacing.sm }}>
          {localUri ? (
            <Image
              source={{ uri: localUri }}
              style={{
                width: "100%",
                aspectRatio: 4 / 5,
                borderRadius: radius.lg,
                backgroundColor: palette.bgElevated,
              }}
              contentFit="cover"
              accessibilityLabel="Selected photograph"
            />
          ) : (
            <View
              style={{
                aspectRatio: 4 / 5,
                borderRadius: radius.lg,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: palette.separatorStrong,
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                padding: spacing.xl,
                gap: spacing.sm,
                backgroundColor: palette.bgElevated,
              }}
            >
              <ThemedText variant="headline">No media yet</ThemedText>
              <ThemedText variant="subheadline" tone="muted" style={{ textAlign: "center" }}>
                Pick a photograph from this phone. We never invent a stand-in frame.
              </ThemedText>
            </View>
          )}
          <Button title={localUri ? "Change photograph" : "Pick photograph"} icon="photo" variant="secondary" onPress={() => void pickMedia()} />
        </View>

        <TextField label="Title" value={title} onChangeText={setTitle} maxLength={120} showCount />
        <TextField
          label="Caption"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={4000}
          showCount
          style={{ minHeight: 120, textAlignVertical: "top" }}
          helper="Optional. Keep it honest."
        />
        <TextField
          label="Tags"
          value={tagsRaw}
          onChangeText={setTagsRaw}
          autoCapitalize="none"
          helper="Comma-separated, up to 8"
          placeholder="music, live, kindness"
        />

        {error ? (
          <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        ) : null}

        <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
          <Button title="Save draft" tone="teal" loading={busy} onPress={() => void submit("DRAFT")} />
          <Button title="Publish to The Wall" tone="coral" loading={busy} onPress={() => void submit("PUBLISHED")} />
          <Button title="Cancel" variant="ghost" disabled={busy} onPress={() => router.back()} />
        </View>
      </ScreenScroll>
    </>
  );
}
