"use client";

import { useEffect, useState } from "react";
import { Activity, Film, HardDrive, Settings2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMediaStore } from "@stores/media.store";

export default function Page() {
  const [view, setView] = useState<"overview" | "jobs" | "assets" | "system">("overview");
  const { jobs, assets, error, loading, load, clearError } = useMediaStore();

  useEffect(() => {
    void load(view);
    const timer = setInterval(() => void load(view), 15000);
    return () => clearInterval(timer);
  }, [load, view]);

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
          <Button><Plus size={15} /> New video</Button>
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
