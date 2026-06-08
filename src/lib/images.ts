import { savePostImageMetadata } from "@/lib/posts";

const ABSOLUTE_URL = /^https?:\/\//i;
const DATA_URL = /^data:/i;
const SUPABASE_STORAGE_PREFIX = /\/storage\/v1\/object\/public\/post-images\//i;
const R2_PUBLIC_BASE_URL = import.meta.env.VITE_R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

/** Turn a stored path or partial URL into a browser-loadable image URL. */
export const resolveImageUrl = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (ABSOLUTE_URL.test(trimmed) || DATA_URL.test(trimmed)) return trimmed;

  const path = trimmed
    .replace(SUPABASE_STORAGE_PREFIX, "")
    .replace(/^post-images\//, "")
    .replace(/^\/+/, "");

  if (R2_PUBLIC_BASE_URL) {
    return `${R2_PUBLIC_BASE_URL}/${path}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${path}`;
};

/** Resolve image src attributes inside stored HTML content. */
export const resolveContentImages = (html: string | null | undefined): string => {
  if (!html) return "";

  return html.replace(/(<img\b[^>]*\ssrc=)(["'])([^"']+)\2/gi, (_, prefix, quote, src) => {
    const resolved = resolveImageUrl(src);
    return resolved ? `${prefix}${quote}${resolved}${quote}` : `${prefix}${quote}${src}${quote}`;
  });
};

const fileExtension = (file: File) => {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/").pop() || "jpg";
};

type PresignResponse = {
  success: boolean;
  presignedUrl?: string;
  objectKey?: string;
  publicFileUrl?: string;
  error?: string;
};

/** Upload an image to R2 via presigned URL and save metadata in Neon. */
export const uploadPostImage = async (file: File, folder = "posts"): Promise<string> => {
  const presignRes = await fetch("/api/presign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: `${crypto.randomUUID()}.${fileExtension(file)}`,
      contentType: file.type || "application/octet-stream",
      folder,
    }),
  });

  const presign: PresignResponse = await presignRes.json();
  if (!presignRes.ok || !presign.success || !presign.presignedUrl || !presign.publicFileUrl || !presign.objectKey) {
    throw new Error(presign.error ?? "Không thể tạo URL tải lên.");
  }

  const uploadRes = await fetch(presign.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Tải ảnh lên storage thất bại.");
  }

  await savePostImageMetadata({
    objectKey: presign.objectKey,
    fileUrl: presign.publicFileUrl,
    folder,
    contentType: file.type || undefined,
  });

  return presign.publicFileUrl;
};
