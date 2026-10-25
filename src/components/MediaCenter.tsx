import { useEffect, useState } from "react";
import { httpsURL, youtubeEmbed } from "../engine/feeds";
import { Panel } from "./UI";
export function MediaCenter({
  visible,
  onPlayback,
}: {
  visible: boolean;
  onPlayback: () => void;
}) {
  const [docked, setDocked] = useState(false),
    [url, setUrl] = useState(""),
    [error, setError] = useState("");
  const [media, setMedia] = useState<{
    src: string;
    embed: boolean;
    local: boolean;
    title: string;
  } | null>(null);
  useEffect(
    () => () => {
      if (media?.local) URL.revokeObjectURL(media.src);
    },
    [media],
  );
  if (!visible && !docked) return null;
  return (
    <section
      className={docked ? "media-dock" : "media-page"}
      aria-label="Media Center"
    >
      <Panel
        title="Media Center"
        eyebrow="WALKTHROUGHS · TRAINING · RECORDINGS"
        action={
          <button className="button small" onClick={() => setDocked((v) => !v)}>
            {docked ? "Undock video" : "Dock video"}
          </button>
        }
      >
        {media ? (
          <div className="video-frame">
            {media.embed ? (
              <iframe
                title={media.title}
                src={media.src}
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                key={media.src}
                src={media.src}
                controls
                playsInline
                onError={() =>
                  setError(
                    "This video could not be played. Check its format and URL.",
                  )
                }
              />
            )}
          </div>
        ) : (
          <div className="media-empty">
            Load an architecture walkthrough or training video.
          </div>
        )}
        {media && (
          <div className="button-row">
            <span>{media.title}</span>
            <button className="button small" onClick={() => setMedia(null)}>
              Close video
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const embed = youtubeEmbed(url.trim());
              const src = embed || httpsURL(url.trim());
              if (!embed && !/\.(mp4|webm)$/i.test(new URL(src).pathname))
                throw new Error(
                  "Use a YouTube link or a direct .mp4/.webm HTTPS URL.",
                );
              setMedia({
                src,
                embed: !!embed,
                local: false,
                title: embed ? "YouTube video" : "Remote video",
              });
              setError("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Invalid URL.");
            }
          }}
        >
          <label className="field">
            YouTube or video URL
            <input
              aria-label="Video URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              required
              type="url"
            />
          </label>
          <button className="button">Load video</button>
        </form>
        <label className="field">
          Upload MP4 / WebM recording (up to 200 MB)
          <input
            type="file"
            accept="video/mp4,video/webm,.mp4,.webm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (
                file.size > 200_000_000 ||
                !/\.(mp4|webm)$/i.test(file.name)
              ) {
                setError("Choose an MP4 or WebM file up to 200 MB.");
                return;
              }
              setMedia({
                src: URL.createObjectURL(file),
                embed: false,
                local: true,
                title: file.name,
              });
              setError("");
            }}
          />
        </label>
        {error && (
          <p role="alert" className="command-error">
            {error}
          </p>
        )}
        <p className="note">
          Uploads stay on this device and are released when closed. YouTube
          loads only after you submit a link. Dock the player to keep it open
          while navigating.
        </p>
        <button className="button" onClick={onPlayback}>
          Open live simulation playback
        </button>
      </Panel>
    </section>
  );
}
