export async function urlToFile(
  url: string,
  filename?: string,
  mimeType?: string,
): Promise<File> {
  if (!filename || !mimeType) {
    const urlParts = url.split("/");
    const fileNameWithExt = urlParts[urlParts.length - 1];
    const fileNameParts = fileNameWithExt.split(".");
    const extension = fileNameParts[fileNameParts.length - 1];

    filename = filename || fileNameWithExt;
    mimeType = mimeType || getMimeTypeFromExtension(extension);
  }

  const response = await fetch(`/api/proxy/${url}`);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

// Helper function to get MIME type from file extension
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    svg: "image/svg",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export async function processHtmlContent(htmlContent: string): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const images = doc.querySelectorAll<HTMLImageElement>("img");

  for (const img of images) {
    const src = img.getAttribute("src");

    if (src && src.startsWith("data:image/")) {
      const file = base64ToBlob(src);
      const uploadedImageUrl = await uploadImage(file);

      if (uploadedImageUrl) {
        img.setAttribute("src", uploadedImageUrl);
      }
    }
  }

  return doc.body.innerHTML;
}

export function base64ToBlob(base64: string): Blob {
  const [prefix, base64Data] = base64.split(",");
  const mimeString = prefix.split(":")[1].split(";")[0];
  const byteString = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}

export async function uploadImage(file: Blob): Promise<string | null> {
  const { $apiClient } = useNuxtApp();

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await $apiClient("/images", {
      method: "POST",
      body: formData,
    }).catch((error) => error.data);

    if (response?.path) {
      return response.path;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
