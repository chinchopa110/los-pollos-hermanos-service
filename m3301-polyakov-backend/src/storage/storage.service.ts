import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? 'los-pollos-hermanos';
    this.endpoint = process.env.S3_ENDPOINT ?? 'https://storage.yandexcloud.net';

    this.client = new S3Client({
      region: process.env.S3_REGION ?? 'ru-central1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async upload(
    key: string,
    body: Buffer | Readable,
    contentType: string,
  ): Promise<string> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
    });

    await upload.done();
    this.logger.log(`Uploaded: ${key}`);
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Deleted: ${key}`);
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
