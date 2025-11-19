/**
 * @fileoverview Progressive Upload Hook
 * @module hooks/useProgressiveUpload
 * @version 1.0.0
 *
 * ⚡🔐 CRITICAL: Real-time progress tracking for secure uploads
 * - WebSocket-based progress updates
 * - Real-time user feedback
 * - Maintains security throughout the process
 * - Memory-efficient handling
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { productionPlanApi } from "@/entities/production-plan/api/productionPlanApi";
import { getAuthToken } from "@/shared/api/client";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProgressUpdate {
  sessionId: string;
  operation: "upload" | "retrieve";
  progress: {
    stage: string;
    percentage: number;
    message: string;
    itemsProcessed: number;
    totalItems: number;
    estimatedTimeRemaining?: number;
  };
  timestamp: number;
}

export interface UploadProgress {
  isActive: boolean;
  stage: string;
  percentage: number;
  message: string;
  itemsProcessed: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  startTime: number;
  duration?: number;
}

export interface UseProgressiveUploadReturn {
  uploadFile: (file: File) => void;
  progress: UploadProgress;
  isUploading: boolean;
  error: string | null;
  result: unknown | null;
  reset: () => void;
}

function normalizeSessionId(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ============================================================================
// PROGRESSIVE UPLOAD HOOK
// ============================================================================

export function useProgressiveUpload(): UseProgressiveUploadReturn {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [progress, setProgress] = useState<UploadProgress>({
    isActive: false,
    stage: "idle",
    percentage: 0,
    message: "Hazır",
    itemsProcessed: 0,
    totalItems: 0,
    startTime: 0,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown | null>(null);

  const registerSessionRoom = useCallback((sessionId?: string | null) => {
    const normalized = normalizeSessionId(sessionId);

    if (!normalized) {
      return;
    }

    sessionIdRef.current = normalized;

    if (socketRef.current?.connected) {
      socketRef.current.emit("join-progress", { sessionId: normalized });
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    let isMounted = true;

    const fetchAuthenticatedSessionId = async (): Promise<string | null> => {
      const token =
        localStorage.getItem("token") || "mock-dev-token-lemnix-2025";

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return null;
        }

        const data: { sessionId?: string; user?: { sessionId?: string } } =
          await response.json();
        return (
          normalizeSessionId(data.sessionId) ||
          normalizeSessionId(data.user?.sessionId)
        );
      } catch (fetchError) {
        console.warn("⚠️ Unable to fetch authenticated session", fetchError);
        return null;
      }
    };

    const initializeSocket = async () => {
      if (socketRef.current) {
        return;
      }

      const serverSessionId = await fetchAuthenticatedSessionId();

      if (!isMounted) {
        return;
      }

      const normalizedSessionId = normalizeSessionId(serverSessionId);
      sessionIdRef.current = normalizedSessionId;

      const socketOptions: Parameters<typeof io>[1] = {
        transports: ["websocket"],
      };

      if (normalizedSessionId) {
        socketOptions.query = { sessionId: normalizedSessionId };
      }

      const socket = io(
        import.meta.env.VITE_WS_URL || "ws://localhost:3001",
        socketOptions,
      );

      socketRef.current = socket;

      socket.on("connect", () => {
        const activeSessionId =
          normalizeSessionId(sessionIdRef.current) ||
          normalizeSessionId(socket.id);

        registerSessionRoom(activeSessionId);

        console.log("🔌 WebSocket connected for progressive upload", {
          sessionId: activeSessionId,
        });
      });

      socket.on("disconnect", () => {
        console.log("🔌 WebSocket disconnected");
      });

      socket.on("progress-update", (update: ProgressUpdate) => {
        if (
          update.operation === "upload" &&
          (!sessionIdRef.current || update.sessionId === sessionIdRef.current)
        ) {
          setProgress((prev) => ({
            ...prev,
            isActive: true,
            stage: update.progress.stage,
            percentage: update.progress.percentage,
            message: update.progress.message,
            itemsProcessed: update.progress.itemsProcessed,
            totalItems: update.progress.totalItems,
            estimatedTimeRemaining: update.progress.estimatedTimeRemaining,
          }));
        }
      });

      // socketRef.current is assigned above for event handlers
    };

    initializeSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [registerSessionRoom]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const token = getAuthToken();
      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/production-plan/upload-progressive", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json();
    },
    onMutate: () => {
      setError(null);
      setResult(null);
      setIsUploading(true);
      setProgress((prev) => ({
        ...prev,
        isActive: true,
        stage: "starting",
        percentage: 0,
        message: "Yükleme başlıyor...",
        startTime: Date.now(),
      }));
    },
    onSuccess: (data) => {
      const response = data as {
        sessionId?: string | null;
        user?: { sessionId?: string | null };
      };

      registerSessionRoom(
        response.sessionId || response.user?.sessionId || null,
      );

      setResult(data);
      setProgress((prev) => ({
        ...prev,
        isActive: false,
        stage: "complete",
        percentage: 100,
        message: "Yükleme tamamlandı!",
        duration: Date.now() - prev.startTime,
      }));

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["production-plan"] });
      queryClient.invalidateQueries({ queryKey: ["production-plan-metrics"] });

      console.log("✅ Progressive upload completed", data);
    },
    onError: (error) => {
      setError(error.message);
      setProgress((prev) => ({
        ...prev,
        isActive: false,
        stage: "error",
        message: `Hata: ${error.message}`,
        duration: Date.now() - prev.startTime,
      }));
      console.error("❌ Progressive upload failed", error);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Upload file function
  const uploadFile = useCallback(
    (file: File) => {
      if (!file) {
        setError("Dosya seçilmedi");
        return;
      }

      if (!socketRef.current?.connected) {
        setError("WebSocket bağlantısı kurulamadı");
        return;
      }

      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  // Reset function
  const reset = useCallback(() => {
    setProgress({
      isActive: false,
      stage: "idle",
      percentage: 0,
      message: "Hazır",
      itemsProcessed: 0,
      totalItems: 0,
      startTime: 0,
    });
    setError(null);
    setResult(null);
    setIsUploading(false);
  }, []);

  return {
    uploadFile,
    progress,
    isUploading,
    error,
    result,
    reset,
  };
}

// ============================================================================
// PROGRESSIVE RETRIEVAL HOOK
// ============================================================================

export function useProgressiveRetrieval() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const [progress, setProgress] = useState<UploadProgress>({
    isActive: false,
    stage: "idle",
    percentage: 0,
    message: "Hazır",
    itemsProcessed: 0,
    totalItems: 0,
    startTime: 0,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeSocket = () => {
      if (socketRef.current?.connected) {
        return;
      }

      const socket = io(import.meta.env.VITE_WS_URL || "ws://localhost:3001", {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("🔌 WebSocket connected for progressive retrieval");
      });

      socket.on("progress-update", (update: ProgressUpdate) => {
        if (update.operation === "retrieve") {
          setProgress((prev) => ({
            ...prev,
            isActive: true,
            stage: update.progress.stage,
            percentage: update.progress.percentage,
            message: update.progress.message,
            itemsProcessed: update.progress.itemsProcessed,
            totalItems: update.progress.totalItems,
            estimatedTimeRemaining: update.progress.estimatedTimeRemaining,
          }));
        }
      });

      socketRef.current = socket;
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const retrieveData = useCallback(
    async (filters: Record<string, unknown> = {}) => {
      try {
        setProgress((prev) => ({
          ...prev,
          isActive: true,
          stage: "starting",
          percentage: 0,
          message: "Veriler yükleniyor...",
          startTime: Date.now(),
        }));

        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("/api/production-plan/progressive", {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error("Data retrieval failed");
        }

        const data = await response.json();

        setProgress((prev) => ({
          ...prev,
          isActive: false,
          stage: "complete",
          percentage: 100,
          message: "Veriler yüklendi!",
          duration: Date.now() - prev.startTime,
        }));

        return data;
      } catch (error) {
        setProgress((prev) => ({
          ...prev,
          isActive: false,
          stage: "error",
          message: `Hata: ${(error as Error).message}`,
          duration: Date.now() - prev.startTime,
        }));
        throw error;
      }
    },
    [],
  );

  return {
    retrieveData,
    progress,
  };
}
