"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/shared/ui";
import { Camera, Upload, Trash2, Loader2 } from "lucide-react";

// Profile photo upload component.
// - Displays the current photo (or initials fallback) in a circular avatar
// - Click to open file picker, or drag-and-drop
// - Uploads to /api/profile/photo as base64 data URL
// - Shows a loading spinner during upload
// - Has a remove button to clear the photo
export function ProfilePhotoUpload({
  photo,
  initials,
  color,
  onUploaded,
}: {
  photo?: string | null;
  initials: string;
  color: string;
  onUploaded?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image too large. Max 2MB.");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch("/api/profile/photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photo: dataUrl }),
          });
          const json = await res.json();
          if (!json.ok) {
            setError(json.error ?? "Upload failed.");
            return;
          }
          onUploaded?.();
        } catch {
          setError("Network error.");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError("Could not read file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed.");
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    try {
      await fetch("/api/profile/photo", { method: "DELETE" });
      onUploaded?.();
    } catch {
      setError("Could not remove photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", pointerEvents: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/* Photo / Avatar with overlay — large touch target for mobile */}
      <div
        className={cn(
          "group relative cursor-pointer rounded-full transition-all duration-300 touch-manipulation",
          dragOver && "ring-4 ring-primary/40 scale-105"
        )}
        style={{ minHeight: 80, minWidth: 80 }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (!uploading) fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        title="Click or tap to upload a photo"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) fileInputRef.current?.click();
          }
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="transition-transform duration-300 group-hover:scale-105">
            <Avatar initials={initials} color={color} size="lg" />
          </div>
        )}

        {/* Camera overlay on hover */}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={uploading}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary transition-all hover:bg-primary/10 hover:scale-105 active:scale-95"
        >
          <Upload className="h-3 w-3" />
          {photo ? "Change" : "Upload"}
        </button>
        {photo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePhoto();
            }}
            disabled={uploading}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-600 transition-all hover:bg-rose-50 hover:scale-105 active:scale-95"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-rose-600">{error}</p>
      )}

      <p className="text-[10px] text-muted-foreground">Click or drag a photo (max 2MB)</p>
    </div>
  );
}
