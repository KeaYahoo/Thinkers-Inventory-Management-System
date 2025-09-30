/**
 * Avatar: reusable profile image with a graceful fallback icon.
 */
import { memo } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

const AvatarComponent = ({ src, alt = "User avatar", size = "md", className }: AvatarProps) => {
  const sizeClass = sizeMap[size] ?? sizeMap.md;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400",
        sizeClass,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <UserCircleIcon aria-hidden="true" className="h-3/4 w-3/4" />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  );
};

export const Avatar = memo(AvatarComponent);
