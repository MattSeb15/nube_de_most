import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
  type UploadTaskSnapshot,
  type StorageReference,
  type FullMetadata,
} from "firebase/storage";
import { storage } from "./config";

// ── Types ──────────────────────────────────────
export interface CloudFile {
  name: string;
  fullPath: string;
  downloadUrl: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
}

export interface CloudFolder {
  name: string;
  fullPath: string;
}

export interface FolderContents {
  files: CloudFile[];
  folders: CloudFolder[];
}

// ── Upload File ────────────────────────────────
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{ downloadUrl: string; fullPath: string }> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadUrl, fullPath: uploadTask.snapshot.ref.fullPath });
      }
    );
  });
}

// ── List Files & Folders ───────────────────────
export async function listFolder(path: string = ""): Promise<FolderContents> {
  const folderRef = ref(storage, path);
  const result = await listAll(folderRef);

  const files: CloudFile[] = await Promise.all(
    result.items.map(async (itemRef: StorageReference) => {
      const [url, metadata] = await Promise.all([
        getDownloadURL(itemRef),
        getMetadata(itemRef),
      ]);
      return {
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        downloadUrl: url,
        size: metadata.size,
        contentType: metadata.contentType || "application/octet-stream",
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
      };
    })
  );

  const folders: CloudFolder[] = result.prefixes.map(
    (folderRef: StorageReference) => ({
      name: folderRef.name,
      fullPath: folderRef.fullPath,
    })
  );

  return { files, folders };
}

// ── Delete File ────────────────────────────────
export async function deleteFile(path: string): Promise<void> {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

// ── Get Download URL ───────────────────────────
export async function getFileUrl(path: string): Promise<string> {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
}

// ── Get File Metadata ──────────────────────────
export async function getFileMetadata(path: string): Promise<FullMetadata> {
  const fileRef = ref(storage, path);
  return getMetadata(fileRef);
}

// ── Helper: format file size ───────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// ── Helper: get file icon by type ──────────────
export function getFileIcon(contentType: string): string {
  if (contentType.startsWith("image/")) return "🖼️";
  if (contentType.startsWith("video/")) return "🎬";
  if (contentType.startsWith("audio/")) return "🎵";
  if (contentType === "application/pdf") return "📄";
  if (contentType.includes("spreadsheet") || contentType.includes("excel")) return "📊";
  if (contentType.includes("presentation") || contentType.includes("powerpoint")) return "📊";
  if (contentType.includes("document") || contentType.includes("word")) return "📝";
  if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("7z")) return "📦";
  if (contentType.includes("text")) return "📃";
  return "📁";
}
