export async function urlToFile(
  url: string,
  filename?: string,
  mimeType?: string,
): Promise<File> {
  // Extract filename and extension from the URL if not provided
  if (!filename || !mimeType) {
    const urlParts = url.split("/");
    const fileNameWithExt = urlParts[urlParts.length - 1];
    const fileNameParts = fileNameWithExt.split(".");
    const extension = fileNameParts[fileNameParts.length - 1];

    filename = filename || fileNameWithExt;
    mimeType = mimeType || getMimeTypeFromExtension(extension);
  }

  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

// Helper function to get MIME type from file extension
function getMimeTypeFromExtension(extension: string): string {
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
