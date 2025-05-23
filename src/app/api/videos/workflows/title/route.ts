import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.

Transcript: {TRANSCRIPT}
`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  //step 1: fetch video from db
  const video = await context.run("fetch-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

    if (!existingVideo) {
      throw new Error("Video not found");
    }

    return existingVideo;
  });

  const transcript = await context.run("fetch-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);

    const text = response.text();

    if (!text) {
      throw new Error("Transcript not found");
    }
    return text;
  });

  interface GeminiCandidate {
    content: {
      parts: { text: string }[];
    };
  }

  interface GeminiResponse {
    candidates: GeminiCandidate[];
  }

  const { body } = await context.call<GeminiResponse>("generate-title", {
    method: "POST",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process
      .env.GEMINI_API_KEY!}`,
    headers: { "Content-Type": "application/json" },
    body: {
      contents: [
        {
          parts: [
            {
              text: TITLE_SYSTEM_PROMPT.replace(
                "{TRANSCRIPT}",
                transcript.slice(0, 3000)
              ), // Gemini has 30k token limit
            },
          ],
        },
      ],
    },
  });

  // get text:
  const response: string = body as unknown as string;
  const parsed = JSON.parse(response);
  const title = parsed.candidates?.[0]?.content.parts[0]?.text;

  if (!title) {
    throw new Error("Title generation failed");
  }

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: title || video.title,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
