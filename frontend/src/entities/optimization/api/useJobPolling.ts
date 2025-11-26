/**
 * Job Polling Hook
 * Polls job status until completion or failure
 *
 * @module entities/optimization/api/useJobPolling
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getJobStatus, type JobStatusResponse } from "./optimizationApi";
import type { OptimizationResult } from "../model/types";

export interface UseJobPollingOptions {
  jobId: string;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
  maxPollAttempts?: number;
  onSuccess?: (result: OptimizationResult) => void;
  onError?: (error: Error) => void;
}

export interface UseJobPollingReturn {
  status: JobStatusResponse["state"] | null;
  progress: number | undefined;
  result: OptimizationResult | null;
  error: string | null;
  isLoading: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  cancel: () => void;
}

/**
 * Hook for polling optimization job status
 */
export function useJobPolling({
  jobId,
  enabled = true,
  pollInterval = 2000, // 2 seconds default
  maxPollAttempts = 300, // 10 minutes max (300 * 2s)
  onSuccess,
  onError,
}: UseJobPollingOptions): UseJobPollingReturn {
  const [status, setStatus] = useState<JobStatusResponse["state"] | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pollAttemptsRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  const poll = useCallback(async () => {
    if (cancelledRef.current || !enabled || !jobId) {
      return;
    }

    if (pollAttemptsRef.current >= maxPollAttempts) {
      setError("Job polling timeout - maximum attempts reached");
      setIsLoading(false);
      if (onError) {
        onError(new Error("Job polling timeout"));
      }
      return;
    }

    try {
      pollAttemptsRef.current += 1;
      const jobStatus = await getJobStatus(jobId);

      setStatus(jobStatus.state);
      setProgress(jobStatus.progress);

      if (jobStatus.state === "completed") {
        setIsLoading(false);
        if (jobStatus.result) {
          setResult(jobStatus.result);
          if (onSuccess) {
            onSuccess(jobStatus.result);
          }
        }
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (jobStatus.state === "failed") {
        setIsLoading(false);
        setError(jobStatus.failedReason || "Job failed");
        if (onError) {
          onError(new Error(jobStatus.failedReason || "Job failed"));
        }
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      // Continue polling for "waiting" and "active" states
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to poll job status";
      setError(errorMessage);
      setIsLoading(false);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
      // Clear interval on error
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [jobId, enabled, maxPollAttempts, onSuccess, onError]);

  useEffect(() => {
    if (!enabled || !jobId || cancelledRef.current) {
      return;
    }

    // Start polling immediately
    poll();

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      if (!cancelledRef.current) {
        poll();
      }
    }, pollInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, enabled, pollInterval, poll]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return {
    status,
    progress,
    result,
    error,
    isLoading,
    isCompleted,
    isFailed,
    cancel,
  };
}

