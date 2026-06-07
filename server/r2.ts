import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export type PresignUploadInput = {
  fileName: string;
  contentType: string;
  folder?: string;
};

export type PresignUploadResult = {
  presignedUrl: string;
  objectKey: string;
  publicFileUrl: string;
};

const getR2Config = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET ?? process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error("Missing R2 storage environment variables.");
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
};

const createR2Client = () => {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
};

export const createPresignedUpload = async ({
  fileName,
  contentType,
  folder = "posts",
}: PresignUploadInput): Promise<PresignUploadResult> => {
  const { bucket, publicBaseUrl } = getR2Config();
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, "") || "posts";
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const objectKey = `${safeFolder}/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 300 });
  const publicFileUrl = `${publicBaseUrl}/${objectKey}`;

  return { presignedUrl, objectKey, publicFileUrl };
};
