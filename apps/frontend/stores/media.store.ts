"use client";

import { create } from "zustand";
import { mediaService, type MediaAsset, type VideoJob } from "@services/media.service";

type MediaView = "overview" | "jobs" | "assets" | "system";

type MediaState = {
  jobs: VideoJob[];
  assets: MediaAsset[];
  loading: boolean;
  error: string | null;
  loadJobs: () => Promise<void>;
  loadAssets: () => Promise<void>;
  load: (view: MediaView) => Promise<void>;
  createJob: (input: Parameters<typeof mediaService.createJob>[0]) => Promise<VideoJob | null>;\n  retryJob: (id: string) => Promise<void>;
  clearError: () => void;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useMediaStore = create<MediaState>((set) => ({
  jobs: [],
  assets: [],
  loading: false,
  error: null,

  loadJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await mediaService.listJobs();
      set({ jobs, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load jobs") });
    }
  },

  loadAssets: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await mediaService.listAssets();
      set({ assets, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load assets") });
    }
  },

  load: async (view) => {
    set({ loading: true, error: null });
    try {
      if (view === "assets") {
        const assets = await mediaService.listAssets();
        set({ assets, loading: false });
        return;
      }

      const jobs = await mediaService.listJobs();
      set({ jobs, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load media") });
    }
  },

  createJob: async (input) => {\n    set({ loading: true, error: null });\n    try {\n      const job = await mediaService.createJob(input);\n      set((state) => ({ jobs: [job, ...state.jobs], loading: false }));\n      return job;\n    } catch (error) {\n      set({ loading: false, error: getErrorMessage(error, "Failed to create video job") });\n      return null;\n    }\n  },\n\n  retryJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await mediaService.retryJob(id);
      set((state) => ({
        jobs: state.jobs.map((job) => (job.id === id ? updated : job)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to retry job") });
    }
  },

  clearError: () => set({ error: null }),
}));
