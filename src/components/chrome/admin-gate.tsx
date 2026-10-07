"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandMark } from "@/components/chrome/app-shell";
import { ShieldCheck, Lock, AlertCircle, Mail, Clock, RefreshCw, CheckCircle2 } from "lucide-react";

// Admin 2FA gate using email-based OTP.
//
// Flow:
// 1. Admin enters email + password on the login page → NextAuth validates → session created
// 2. This gate appears → automatically sends an OTP to the admin's registered email
// 3. Admin enters the 6-digit OTP received by email
// 4. The OTP is validated via /api/auth/verify-otp → if valid, gate unlocks
//
// In production, the OTP is sent via email (nodemailer/SendGrid).
// In this demo, the OTP is returned by the API and displayed on screen
// so the user can see it without a real email service.

export function Admin2FAGate() {
  const { data: session } = useSession();
  const { unlockAdmin, signOut } = useApp();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // OTP send state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(300);
  const [verifying, setVerifying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-send OTP when the gate loads.
  // Also recover from any stale state: if the user already unlocked the
  // admin session on a previous render but the React context lost it
  // (e.g. after a manual page reload while sessionStorage still has
  // ADMIN_KEY=1), force a hard refresh so the Router re-evaluates.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("skillmatch.admin-unlocked") === "1") {
        unlockAdmin();
        return;
      }
    } catch {
      /* ignore */
    }
    sendOtp();
  }, []);

  // Countdown for OTP expiry
  useEffect(() => {
    if (!sent || expiresIn <= 0) return;
    const id = setInterval(() => {
      setExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [sent, expiresIn]);

  // Countdown for rate-limit lockout
  useEffect(() => {
    if (lockedUntil === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setLockedUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Focus input after OTP is sent
  useEffect(() => {
    if (sent && !verifying) inputRef.current?.focus();
  }, [sent, verifying]);

  const sendOtp = async () => {
    setSending(true);
    setError(null);
    setSent(false);
    setGeneratedOtp(null);
    try {
      const email = session?.user?.email;
      if (!email) {
        setError("No admin email found. Please sign out and try again.");
        return;
      }
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
        setGeneratedOtp(data.otp); // Demo: show the OTP on screen
        setExpiresIn(data.expiresIn ?? 300);
      } else {
        setError(data.error ?? "Failed to send OTP.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil !== null) return;
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const email = session?.user?.email;
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.ok) {
        setUnlocked(true);
        setError(null);
        // Small delay for visual feedback before unlocking.
        // We call unlockAdmin() to flip the context flag (which causes the
        // parent Router to swap from <Admin2FAGate/> to <AppShell>+admin view),
        // AND we hard-navigate to "/" as a belt-and-suspenders fallback in
        // case the React state update doesn't propagate (e.g. due to a
        // stale closure or hydration mismatch).
        setTimeout(() => {
          unlockAdmin();
          // Hard refresh as a fallback — guarantees the Router re-runs with
          // the unlocked sessionStorage flag set, so the admin dashboard
          // always renders even if React state failed to update.
          if (typeof window !== "undefined") {
            window.location.assign("/");
          }
        }, 800);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) {
          setLockedUntil(Date.now() + 30_000);
          setError("Too many failed attempts. Locked for 30 seconds.");
        } else {
          setError(data.error ?? `Invalid OTP. ${5 - next} attempt${5 - next === 1 ? "" : "s"} remaining.`);
        }
        setOtp("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
          <p className="text-lg font-semibold text-emerald-700">Access granted!</p>
          <p className="text-sm text-muted-foreground">Redirecting to admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>

        <Card className="border-amber-200/60 shadow-card-soft">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">Admin Email Verification</CardTitle>
            <CardDescription>
              You're signed in as <span className="font-semibold text-foreground">{session?.user?.name ?? "admin"}</span> ({session?.user?.email ?? ""}).
              <br />
              An OTP has been sent to your registered email. Enter it below to access the admin console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sending ? (
              <div className="flex flex-col items-center py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-sm text-muted-foreground">Generating OTP and sending to your email…</p>
              </div>
            ) : !sent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Mail className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">Click the button below to receive an OTP at your registered email address.</p>
                <Button className="btn-blue w-full" onClick={sendOtp}>
                  <Mail className="h-4 w-4" /> Send OTP to my email
                </Button>
                {error && (
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp-code">6-digit OTP from your email</Label>
                  <Input
                    ref={inputRef}
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={lockedUntil !== null || verifying}
                    className="text-center text-lg tracking-[0.5em] font-mono"
                    autoComplete="one-time-code"
                  />
                </div>

                {/* OTP expiry countdown */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {expiresIn > 0 ? (
                    <span>OTP expires in <span className="font-semibold text-foreground">{Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}</span></span>
                  ) : (
                    <span className="text-rose-600">OTP has expired</span>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                {lockedUntil !== null && (
                  <div className="flex items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Lock className="h-3.5 w-3.5" />
                    Locked — try again in {secondsLeft}s
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 btn-green"
                  disabled={lockedUntil !== null || otp.length !== 6 || verifying || expiresIn <= 0}
                >
                  {verifying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify & access dashboard
                    </>
                  )}
                </Button>

                {/* Resend OTP */}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sending || expiresIn > 240}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 text-xs text-primary hover:underline",
                    (sending || expiresIn > 240) && "opacity-50 pointer-events-none"
                  )}
                >
                  <RefreshCw className="h-3 w-3" />
                  {expiresIn > 240 ? "Resend available in a moment" : "Resend OTP"}
                </button>

                {/* Demo: show the OTP (in production this would be emailed, not shown) */}
                {generatedOtp && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <Mail className="h-3.5 w-3.5" /> Demo: Your OTP
                    </p>
                    <div className="mt-2 flex items-center justify-between rounded bg-white px-3 py-2">
                      <code className="font-mono text-xl font-bold tracking-[0.3em] text-blue-900">
                        {generatedOtp}
                      </code>
                      <span className="text-[11px] text-blue-600">
                        {expiresIn > 0 ? `${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, "0")}` : "expired"}
                      </span>
                    </div>
                    <p className="mt-2 text-blue-700">
                      In production, this OTP would be sent to <span className="font-medium">{session?.user?.email}</span> via email.
                      It would NOT be displayed on screen.
                    </p>
                  </div>
                )}
              </form>
            )}

            <div className="mt-4 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Sign out
              </button>
              <span className="text-muted-foreground">
                Attempts: {attempts}/5
              </span>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          The OTP is valid for 5 minutes. Admin sessions auto-lock after 30 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
