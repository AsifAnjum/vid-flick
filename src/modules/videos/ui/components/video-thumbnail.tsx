import { THUMBNAIL_FALLBACK } from "@/constant";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
  imageURL?: string | null;
  previewURL?: string | null;
  title: string;
  duration: number;
}

export const VideoThumbnail = ({
  title,
  imageURL,
  duration,
  previewURL,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* thumbnail wrapper */}
      <div>
        <div className="relative w-full overflow-hidden rounded-xl aspect-video">
          <Image
            src={imageURL || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="size-full object-cover group-hover:opacity-0"
          />
          <Image
            unoptimized={!!previewURL}
            src={previewURL || THUMBNAIL_FALLBACK}
            alt={title}
            fill
            className="size-full object-cover opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>
      {/* DURATION BOX */}
      <div>
        <div className="absolute bottom-2 right-2 rounded-full bg-black/80 px-1 py-0.5  text-xs text-white font-medium">
          {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
};
