import Image from "next/image";
import { cn } from "@/lib/utils";

const CREST = "/images/01_Crest_Emblem";

/** Canonical paths for MNCommand crest assets. */
export const BRAND_ASSETS = {
  icon: {
    svg: `${CREST}/SVG/MNCommand_icon.svg`,
    png32: `${CREST}/PNG/icon/MNCommand_icon_32.png`,
    png180: `${CREST}/PNG/icon/MNCommand_icon_180.png`,
    png192: `${CREST}/PNG/icon/MNCommand_icon_192.png`,
    png512: `${CREST}/PNG/icon/MNCommand_icon_512.png`,
  },
  horizontal: {
    onDark: `${CREST}/PNG/horizontal/MNCommand_logo_horizontal_light_transparent.png`,
    onLight: `${CREST}/PNG/horizontal/MNCommand_logo_horizontal_dark_transparent.png`,
  },
  stacked: {
    onDark: `${CREST}/PNG/stacked/MNCommand_logo_stacked_light_transparent.png`,
    onLight: `${CREST}/PNG/stacked/MNCommand_logo_stacked_dark_transparent.png`,
  },
  watermark: {
    stackedOnDark: `${CREST}/PNG/stacked/MNCommand_logo_stacked_light_transparent.png`,
  },
} as const;

export type BrandVariant = "icon" | "horizontal" | "stacked";
export type BrandSurface = "onDark" | "onLight";

const DEFAULT_SIZE: Record<
  BrandVariant,
  { width: number; height: number }
> = {
  icon: { width: 40, height: 40 },
  horizontal: { width: 200, height: 48 },
  stacked: { width: 160, height: 120 },
};

function resolveSrc(variant: BrandVariant, surface: BrandSurface): string {
  if (variant === "icon") return BRAND_ASSETS.icon.png192;
  return BRAND_ASSETS[variant][surface];
}

export function BrandMark({
  variant = "horizontal",
  surface = "onDark",
  width,
  height,
  className,
  priority = false,
  alt = "Merchant Nation Command",
}: {
  variant?: BrandVariant;
  surface?: BrandSurface;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const defaults = DEFAULT_SIZE[variant];
  const w = width ?? defaults.width;
  const h = height ?? defaults.height;

  return (
    <Image
      src={resolveSrc(variant, surface)}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
