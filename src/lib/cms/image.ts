import type { CmsImage } from "./types";

/** Props for next/image with intrinsic dimensions. */
export function imageProps(img: CmsImage) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
    ...(img.blurDataURL ? { placeholder: "blur" as const, blurDataURL: img.blurDataURL } : {}),
  };
}

/** Props for next/image in `fill` mode. */
export function fillProps(img: CmsImage) {
  return {
    src: img.src,
    alt: img.alt,
    fill: true as const,
    ...(img.blurDataURL ? { placeholder: "blur" as const, blurDataURL: img.blurDataURL } : {}),
  };
}
