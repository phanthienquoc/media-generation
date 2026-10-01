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
  retryJob: (id: string) => Promise<void>;
  clearError: () => void;
};

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
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to load jobs" });
    }
  },

  loadAssets: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await mediaService.listAssets();
      set({ assets, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to load assets" });
    }
  },

  load: async (view) => {
    if (view === "assets") return useMediaStore.getState().loadAssets();
    return useMediaStore.getState().loadJobs();
  },

  retryJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await mediaService.retryJob(id);
      set((state) => ({
        jobs: state.jobs.map((job) => (job.id === id ? updated : job)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to retry job" });
    }
  },

  clearError: () => set({ error: null }),
}));
