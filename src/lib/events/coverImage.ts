export const MAX_COVER_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

export type CropPixels = { x: number; y: number; width: number; height: number };

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/** Crops `imageSrc` to `cropPixels` and downscales so the long edge is at most `MAX_COVER_DIMENSION`. */
export async function getCroppedImageBlob(
  imageSrc: string,
  cropPixels: CropPixels,
  aspect: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const outputWidth = Math.round(Math.min(cropPixels.width, MAX_COVER_DIMENSION));
  const outputHeight = Math.round(outputWidth / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image"));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
