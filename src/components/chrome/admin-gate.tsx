"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandMark } from "@/components/chrome/app-shell";
import { ShieldCheck, Lock, AlertCircle, Fingerprint, Clock } from "lucide-react";

// Demo 2FA: the code is always "123456" and shown to the user.
// In production this would be replaced by TOTP / SMS / email OTP.
const DEMO_2FA_CODE = "123456";

export function Admin2FAGate() {
  const { user, unlockAdmin, signOut } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil !== null) return;
    if (code.trim() === DEMO_2FA_CODE) {
      setError(null);
      unlockAdmin();
    } else {
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
              You're signed in as <span className="font-semibold text-foreground">{user?.name}</span>.
              Enter your 2FA code to access the admin console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="2fa-code">6-digit verification code</Label>
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

            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <Fingerprint className="h-3.5 w-3.5" /> Demo 2FA code
              </p>
              <p className="mt-1 text-blue-700">
                For this demo, the code is <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono font-bold tracking-widest">123456</code>.
                In production this would be delivered via TOTP app, SMS, or email.
              </p>
            </div>

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
