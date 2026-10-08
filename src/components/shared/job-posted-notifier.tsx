"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, X, ArrowRight, Bell } from "lucide-react";

// Global popup notification that appears when a new job is posted.
// It checks sessionStorage for a "skillmatch.jobPosted" flag set by the
// employer's job-edit page after a successful publish, then shows a
// popup with sound.
//
// Also polls /api/notifications every 60s for new job-posted notifications
// from other employers (so seekers see popups in real-time).

interface JobPostedData {
  title: string;
  company: string;
  timestamp: number;
}

export function JobPostedNotifier() {
  const [popup, setPopup] = useState<JobPostedData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotifCheck = useRef<number>(Date.now());

  // Play a notification sound using the Web Audio API (no external file needed)
  const playSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Play a pleasant 3-note chime
      const notes = [
        { freq: 523.25, time: 0, duration: 0.15 },    // C5
        { freq: 659.25, time: 0.12, duration: 0.15 },  // E5
        { freq: 783.99, time: 0.24, duration: 0.25 },  // G5
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = note.freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.duration);
      });
    } catch {
      /* AudioContext not available — silent fallback */
    }
  };

  // Check for job-posted flag from sessionStorage (set by employer after publishing)
  useEffect(() => {
    const checkPosted = () => {
      try {
        const raw = sessionStorage.getItem("skillmatch.jobPosted");
        if (raw) {
          const data = JSON.parse(raw) as JobPostedData;
          // Only show if within last 10 seconds
          if (Date.now() - data.timestamp < 10000) {
            setPopup(data);
            setDismissed(false);
            playSound();
            // Auto-dismiss after 8 seconds
            setTimeout(() => {
              setPopup(null);
            }, 8000);
          }
          sessionStorage.removeItem("skillmatch.jobPosted");
        }
      } catch { /* ignore */ }
    };

    // Check immediately on mount
    checkPosted();
    // Also check every 2 seconds (covers page transitions within the SPA)
    const interval = setInterval(checkPosted, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll for new notifications (job-posted type) — for seekers seeing other employers' posts
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        const notifs = data?.notifications ?? [];
        // Find unread "job" type notifications created after our last check
        const newJobNotifs = notifs.filter(
          (n: any) => n.type === "job" && !n.read && new Date(n.createdAt).getTime() > lastNotifCheck.current
        );
        if (newJobNotifs.length > 0) {
          const latest = newJobNotifs[0];
          setPopup({
            title: latest.message?.split("—")[0]?.trim() ?? "New job posted",
            company: latest.message?.split("—")[1]?.trim() ?? "",
            timestamp: Date.now(),
          });
          setDismissed(false);
          playSound();
          lastNotifCheck.current = Date.now();
          setTimeout(() => setPopup(null), 8000);
        }
        lastNotifCheck.current = Date.now();
      } catch { /* ignore */ }
    };

    // Poll every 60 seconds
    const interval = setInterval(pollNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!popup || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] max-w-sm animate-fade-up"
      role="alert"
      aria-live="assertive"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-card shadow-2xl">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg">
              <Briefcase className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Bell className="h-3 w-3 text-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">New Job Posted</p>
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">{popup.title}</p>
              {popup.company && (
                <p className="text-xs text-muted-foreground">{popup.company}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                A new job matching your profile has been posted. Check it out before it expires!
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => { setPopup(null); setDismissed(true); }}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action */}
          <button
            onClick={() => {
              // Navigate to jobs page
              window.dispatchEvent(new CustomEvent("navigate", { detail: { view: "recommended" } }));
              setPopup(null);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View job <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
