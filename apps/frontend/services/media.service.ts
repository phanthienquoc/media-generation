import { api } from "@lib/api";

export type CreateVideoJobInput = {\n  prompt: string;\n  model?: string;\n  aspectRatio?: string;\n  resolution?: string;\n  attempts?: number;\n};\n\nexport type VideoJob = {
  id: string;
  prompt: string;
  model: string;
  aspect_ratio: string;
  resolution: string;
  status: string;
  created_at: string;
};

export type MediaAsset = {
  storage_path: string;
  mime_type: string;
  byte_size?: number;
  signed_url?: string;
};

export const mediaService = {
  createJob(input: CreateVideoJobInput) {\n    return api<VideoJob>("/video-jobs", {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify(input),\n    });\n  },\n\n  listJobs(limit = 50) {
    return api<VideoJob[]>(`/video-jobs?limit=${limit}`);
  },

  getJob(id: string) {
    return api<VideoJob>(`/video-jobs/${id}`);
  },

  retryJob(id: string) {
    return api<VideoJob>(`/video-jobs/${id}/retry`, { method: "POST" });
  },

  listAssets(limit = 50) {
    return api<MediaAsset[]>(`/assets?limit=${limit}`);
  },
};
