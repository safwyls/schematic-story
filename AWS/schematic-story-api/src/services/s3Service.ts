// ==========================================
// src/services/s3Service.ts
// ==========================================

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'schematic-story-files';

export class S3Service {
  static async getUploadUrl(key: string, contentType?: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream'
    });

    // Generate presigned URL valid for 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  }

  static async getDownloadUrl(schematicId: string): Promise<string> {
    // Construct the S3 key - you might want to store the actual key in DynamoDB
    const key = `schematics/${schematicId}/file.schematic`;
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    // Generate presigned URL valid for 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  }
}