/**
 * Compresses an uploaded image file using an in-memory Canvas
 * and returns a lightweight base64 Data URL (typically 20KB-40KB).
 */
export function compressImageFile(file: File, maxDimension = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read directly as data URL without rasterizing
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (e) => reject(e);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

