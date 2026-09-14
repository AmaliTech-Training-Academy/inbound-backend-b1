import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import crypto from "node:crypto";
import path from "node:path";
import s3Client from "../configs/s3.js";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export const uploadToS3 = async ({
  buffer,
  originalName,
  mimetype,
  folder = "attachments",
}) => {
  const extension = path.extname(originalName);

  const fileName = `${crypto.randomUUID()}${extension}`;
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ServerSideEncryption: "AES256",
  });

  await s3Client.send(command);

  return {
    bucket: BUCKET_NAME,
    key,
    originalName,
    mimetype,
  };
};

export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};