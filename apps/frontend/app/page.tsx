"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Activity, Film, HardDrive, Settings2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaStore } from "@stores/media.store";

export default function Page() {
  const [view, setView] = useState<"overview" | "jobs" | "assets" | "system">("overview");
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("veo-3.1-fast-generate-preview");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const { jobs, assets, error, loading, load, createJob, clearError } = useMediaStore();

  useEffect(() => {
    void load(view);
    const timer = setInterval(() => void load(view), 15000);
    return () => clearInterval(timer);
  }, [load, view]);

  const submitNewVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    const job = await createJob({ prompt: prompt.trim(), model, aspectRatio, resolution });
    if (!job) return;
    setPrompt("");
    setShowNewVideo(false);
    setView("jobs");
  };

  const reload = () => {
    clearError();
    void load(view);
  };

  const nav = [
    ["overview", "Overview", Activity],
    ["jobs", "Jobs", Film],
    ["assets", "Assets", HardDrive],
    ["system", "System", Settings2],
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <header className="sticky top-0 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl justify-between">
          <b>Media</b>
          <span className="font-mono text-xs text-muted-foreground">media.mrcute.space</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {error && (
          <Card>
            <CardContent className="flex items-center gap-3 text-sm text-destructive">
              <span className="min-w-0 flex-1 truncate">{error}</span>
              <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
                <RefreshCw size={14} />
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Media generation</h1>
            <p className="text-sm text-muted-foreground">Generate, inspect, and retry video jobs.</p>
          </div>
          <Button onClick={() => setShowNewVideo(true)}><Plus size={15} /> New video</Button>
        </div>

        {view === "overview" && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {["QUEUED", "PROCESSING", "READY", "FAILED"].map((status) => (
              <Card key={status}>
                <CardContent className="pt-6">
                  <div className="text-xs text-muted-foreground">{status}</div>
                  <div className="font-mono text-2xl">{jobs.filter((j) => j.status === status).length}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {view === "assets" ? (
          <div className="grid gap-3">
            {assets.map((asset) => (
              <Card key={asset.storage_path}>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <b className="block truncate">{asset.storage_path.split("/").pop()}</b>
                    <div className="text-xs text-muted-foreground">{asset.mime_type}</div>
                  </div>
                  {asset.signed_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(asset.signed_url, "_blank")}>
                      Open
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-2">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex justify-between gap-3 pt-6">
                  <div className="min-w-0">
                    <b className="block truncate">{job.prompt}</b>
                    <span className="font-mono text-xs text-muted-foreground">
                      {job.model} · {job.aspect_ratio} · {job.resolution}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs">{job.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showNewVideo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form onSubmit={submitNewVideo} className="w-full max-w-lg space-y-4 rounded-xl border bg-background p-5 shadow-xl">
            <div>
              <h2 className="text-lg font-semibold">New video</h2>
              <p className="text-sm text-muted-foreground">Create a queued video generation job.</p>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Prompt</span>
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} required autoFocus rows={5} className="rounded-md border bg-background px-3 py-2 outline-none focus:ring-2" placeholder="Describe the video you want to generate..." />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Model</span>
                <select value={model} onChange={(event) => setModel(event.target.value)} className="rounded-md border bg-background px-3 py-2">
                  <option value="veo-3.1-fast-generate-preview">Veo 3.1 Fast</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Aspect ratio</span>
                <select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} className="rounded-md border bg-background px-3 py-2">
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Resolution</span>
              <select value={resolution} onChange={(event) => setResolution(event.target.value)} className="rounded-md border bg-background px-3 py-2">
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewVideo(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !prompt.trim()}>{loading ? "Creating..." : "Create video"}</Button>
            </div>
          </form>
        </div>
      )}

      <nav className="fixed bottom-0 flex w-full border-t bg-background">
        {nav.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={"flex flex-1 flex-col items-center py-2 text-xs " + (view === id ? "font-semibold" : "text-muted-foreground")}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
