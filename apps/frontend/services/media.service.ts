import { api } from "@lib/api";

export type VideoJob = {
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
  listJobs(limit = 50) {
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
