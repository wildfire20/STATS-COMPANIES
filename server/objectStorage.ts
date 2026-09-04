import { Storage, File } from "@google-cloud/storage";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassThrough } from "stream";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  AclObject,
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const replitStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export interface StoredObjectMetadata {
  contentType?: string;
  size?: number;
  customMetadata: Record<string, string>;
}

export interface StoredObject extends AclObject {
  getMetadata(): Promise<StoredObjectMetadata>;
  save(body: Buffer, options: { contentType: string; metadata?: Record<string, string> }): Promise<void>;
  createReadStream(range?: { start: number; end: number }): NodeJS.ReadableStream;
}

class GoogleStoredObject implements StoredObject {
  constructor(private readonly file: File) {}
  get name() { return this.file.name; }
  async exists() { return (await this.file.exists())[0]; }
  async getMetadata(): Promise<StoredObjectMetadata> {
    const metadata = (await this.file.getMetadata())[0];
    return {
      contentType: metadata.contentType,
      size: Number(metadata.size) || undefined,
      customMetadata: (metadata.metadata || {}) as Record<string, string>,
    };
  }
  async getCustomMetadata() { return (await this.getMetadata()).customMetadata; }
  async setCustomMetadata(metadata: Record<string, string>) {
    const current = await this.getCustomMetadata();
    await this.file.setMetadata({ metadata: { ...current, ...metadata } });
  }
  async save(body: Buffer, options: { contentType: string; metadata?: Record<string, string> }) {
    await this.file.save(body, {
      resumable: false,
      contentType: options.contentType,
      metadata: { contentType: options.contentType, metadata: options.metadata },
    });
  }
  createReadStream(range?: { start: number; end: number }) {
    return this.file.createReadStream(range);
  }
}

class S3StoredObject implements StoredObject {
  private cachedMetadata?: StoredObjectMetadata;
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    public readonly name: string,
  ) {}
  async exists() {
    try {
      await this.getMetadata();
      return true;
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false;
      throw error;
    }
  }
  async getMetadata(): Promise<StoredObjectMetadata> {
    if (this.cachedMetadata) return this.cachedMetadata;
    const result = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.name }));
    this.cachedMetadata = {
      contentType: result.ContentType,
      size: result.ContentLength,
      customMetadata: result.Metadata || {},
    };
    return this.cachedMetadata;
  }
  async getCustomMetadata() { return (await this.getMetadata()).customMetadata; }
  async setCustomMetadata(metadata: Record<string, string>) {
    const current = await this.getMetadata();
    const body = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.name }));
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.name,
      Body: body.Body,
      ContentType: current.contentType,
      Metadata: { ...current.customMetadata, ...metadata },
    }));
    this.cachedMetadata = undefined;
  }
  async save(body: Buffer, options: { contentType: string; metadata?: Record<string, string> }) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.name,
      Body: body,
      ContentType: options.contentType,
      Metadata: options.metadata,
    }));
    this.cachedMetadata = undefined;
  }
  createReadStream(range?: { start: number; end: number }) {
    const output = new PassThrough();
    this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.name,
      Range: range ? `bytes=${range.start}-${range.end}` : undefined,
    })).then((result) => {
      const body = result.Body;
      if (!body || !(body as any).pipe) return output.destroy(new Error("Storage returned an empty body"));
      (body as any).on("error", (error: Error) => output.destroy(error)).pipe(output);
    }).catch((error) => output.destroy(error));
    return output;
  }
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
  }
}

const railwayStorageEnv = {
  bucket: process.env.BUCKET || process.env.RAILWAY_BUCKET_NAME,
  endpoint: process.env.ENDPOINT || process.env.RAILWAY_ENDPOINT,
  region: process.env.REGION || process.env.RAILWAY_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID || process.env.RAILWAY_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY || process.env.RAILWAY_SECRET_ACCESS_KEY,
};

function hasRailwayStorageConfig() {
  return Object.values(railwayStorageEnv).every(Boolean);
}

function assertProductionStorageConfig() {
  if (process.env.NODE_ENV !== "production" && !process.env.RAILWAY_ENVIRONMENT_ID) return;
  const missing = Object.entries(railwayStorageEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(`Railway object storage is not configured; missing ${missing.join(", ")}`);
  }
}

function createS3Client() {
  return new S3Client({
    endpoint: railwayStorageEnv.endpoint,
    region: railwayStorageEnv.region,
    credentials: {
      accessKeyId: railwayStorageEnv.accessKeyId!,
      secretAccessKey: railwayStorageEnv.secretAccessKey!,
    },
    forcePathStyle: false,
  });
}

export class ObjectStorageService {
  constructor() {
    assertProductionStorageConfig();
  }

  private readonly railway = hasRailwayStorageConfig();
  private readonly s3 = this.railway ? createS3Client() : null;

  get providerName() { return this.railway ? "railway" : "replit"; }

  private getDefaultBucket(): string {
    const bucket = this.railway ? railwayStorageEnv.bucket : process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    if (!bucket) throw new Error("Object storage is not configured");
    return bucket;
  }

  getObject(key: string, bucket = this.getDefaultBucket()): StoredObject {
    const normalizedKey = key.replace(/^\/+/, "");
    if (this.railway) return new S3StoredObject(this.s3!, bucket, normalizedKey);
    return new GoogleStoredObject(replitStorageClient.bucket(bucket).file(normalizedKey));
  }

  getPublicObjectSearchPaths(): string[] {
    if (this.railway) return ["public"];
    const paths = Array.from(new Set((process.env.PUBLIC_OBJECT_SEARCH_PATHS || "")
      .split(",").map((path) => path.trim()).filter(Boolean)));
    if (!paths.length) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS is not configured");
    return paths;
  }

  getPrivateObjectDir(): string {
    if (this.railway) return "private";
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) throw new Error("PRIVATE_OBJECT_DIR is not configured");
    return dir;
  }

  private getPrivateObject(entityId: string): StoredObject {
    const privateDir = this.getPrivateObjectDir().replace(/\/+$/g, "");
    if (this.railway) {
      return this.getObject(`${privateDir.replace(/^\/+/g, "")}/${entityId}`);
    }
    const { bucketName, objectName } = parseObjectPath(`${privateDir}/${entityId}`);
    return this.getObject(objectName, bucketName);
  }

  async searchPublicObject(filePath: string): Promise<StoredObject | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = [searchPath, filePath].filter(Boolean).join("/");
      const { bucketName, objectName } = this.railway
        ? { bucketName: this.getDefaultBucket(), objectName: fullPath }
        : parseObjectPath(fullPath);
      const file = this.getObject(objectName, bucketName);
      if (await file.exists()) return file;
    }
    return null;
  }

  async downloadObject(file: StoredObject, res: Response, cacheTtlSec = 3600) {
    const metadata = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === "public";
    res.set({
      "Content-Type": metadata.contentType || "application/octet-stream",
      "Content-Length": metadata.size,
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    });
    const stream = file.createReadStream();
    stream.on("error", (error) => {
      console.error("Object stream error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Error streaming file" });
      else res.destroy(error as Error);
    });
    stream.pipe(res);
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const entityId = `uploads/${randomUUID()}`;
    if (this.railway) {
      const objectName = `${this.getPrivateObjectDir().replace(/^\/+|\/+$/g, "")}/${entityId}`;
      return getSignedUrl(this.s3!, new PutObjectCommand({
        Bucket: this.getDefaultBucket(),
        Key: objectName,
      }), { expiresIn: 900 });
    }
    const privateDir = this.getPrivateObjectDir().replace(/\/+$/g, "");
    const { bucketName, objectName } = parseObjectPath(`${privateDir}/${entityId}`);
    return signReplitObjectURL({ bucketName, objectName, method: "PUT", ttlSec: 900 });
  }

  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
    const entityId = objectPath.slice("/objects/".length);
    if (!entityId) throw new ObjectNotFoundError();
    const file = this.getPrivateObject(entityId);
    if (!(await file.exists())) throw new ObjectNotFoundError();
    return file;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) return rawPath;
    let pathname: string;
    try { pathname = new URL(rawPath).pathname; } catch { return rawPath; }
    const privateDir = this.getPrivateObjectDir().replace(/\/+$/g, "");
    const marker = `${privateDir.startsWith("/") ? privateDir : `/${privateDir}`}/`;
    const markerIndex = pathname.indexOf(marker);
    return markerIndex >= 0 ? `/objects/${pathname.slice(markerIndex + marker.length)}` : pathname;
  }

  async trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: ObjectAclPolicy): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) return normalizedPath;
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity(args: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }) {
    return canAccessObject({
      ...args,
      requestedPermission: args.requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const parts = `/${path}`.replace(/^\/+/, "/").split("/");
  if (parts.length < 3) throw new Error("Invalid object path");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function signReplitObjectURL({
  bucketName, objectName, method, ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}) {
  const response = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`Failed to sign Replit object URL: ${response.status}`);
  return (await response.json()).signed_url as string;
}