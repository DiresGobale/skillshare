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
import { ShieldCheck, Lock, AlertCircle, Fingerprint, Clock, RefreshCw } from "lucide-react";
import { authenticator } from "otplib";

// Admin 2FA gate.
//
// In the previous version this used a static "123456" code. Now it uses real
// TOTP via otplib: the admin's secret is stored in the database (set during
// `bun run scripts/seed.ts`). The current 6-digit code is derived from that
// secret using the standard TOTP algorithm (30s window, 6 digits, SHA-1).
//
// For demo convenience, we expose the current TOTP code in the gate UI so the
// user can copy it without needing to scan a QR code. In production this would
// be hidden and the user would use their authenticator app.

export function Admin2FAGate() {
  const { data: session } = useSession();
  const { unlockAdmin, signOut } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the admin's TOTP secret + current code from the API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/2fa-info");
        const data = await res.json();
        if (!cancelled && data.ok) {
          setAdminSecret(data.secret);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Focus the input on mount
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

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

  // Live TOTP code preview (updates every 30s)
  const [liveCode, setLiveCode] = useState<string>("");
  const [codeExpiresIn, setCodeExpiresIn] = useState<number>(30);
  useEffect(() => {
    if (!adminSecret) return;
    const update = () => {
      setLiveCode(authenticator.generate(adminSecret));
      const epoch = Math.floor(Date.now() / 1000);
      setCodeExpiresIn(30 - (epoch % 30));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [adminSecret]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil !== null) return;
    if (!adminSecret) {
      setError("2FA secret not loaded yet. Please wait.");
      return;
    }
    try {
      const ok = authenticator.verify({ token: code.trim(), secret: adminSecret });
      if (ok) {
        setError(null);
        unlockAdmin();
      } else {
        throw new Error("Invalid");
      }
    } catch {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setError("Too many failed attempts. Locked for 30 seconds.");
      } else {
        setError(`Invalid code. ${5 - next} attempt${5 - next === 1 ? "" : "s"} remaining.`);
      }
      setCode("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
            <CardTitle className="text-lg">Admin verification required</CardTitle>
            <CardDescription>
              You're signed in as <span className="font-semibold text-foreground">{session?.user?.name ?? "admin"}</span>.
              Enter your TOTP code from your authenticator app to access the admin console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="2fa-code">6-digit TOTP code</Label>
                <Input
                  ref={inputRef}
                  id="2fa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={lockedUntil !== null}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {lockedUntil !== null && (
                <div className="flex items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  Locked — try again in {secondsLeft}s
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10"
                disabled={lockedUntil !== null || code.length !== 6}
              >
                <Lock className="h-4 w-4" />
                {lockedUntil !== null ? "Locked" : "Verify & continue"}
              </Button>
            </form>

            {/* Demo helper: show the live TOTP code derived from the admin secret */}
            {adminSecret && (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Fingerprint className="h-3.5 w-3.5" /> Demo: live TOTP code
                </p>
                <div className="mt-2 flex items-center justify-between rounded bg-white px-2 py-1.5">
                  <code className="font-mono text-base font-bold tracking-[0.3em] text-blue-900">
                    {liveCode || "------"}
                  </code>
                  <span className="flex items-center gap-1 text-[11px] text-blue-700">
                    <RefreshCw className="h-3 w-3" /> {codeExpiresIn}s
                  </span>
                </div>
                <p className="mt-2 text-blue-700">
                  For production, hide this box and let admins use their authenticator app.
                  Secret: <code className="rounded bg-blue-100 px-1 font-mono">{adminSecret}</code>
                </p>
              </div>
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
          Admin sessions auto-lock after 30 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
