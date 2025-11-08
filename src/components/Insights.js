// Insights.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Target, AlertCircle, Sparkles } from 'lucide-react';
import { useAIInsights } from '../contexts/AIInsightsContext';

/**
 * Guarantees:
 * - Only one automatic attempt per task (no automatic retries).
 * - Concurrent mounts share the same in-flight promise (dedupe).
 * - Manual refresh is the only way to force a new attempt.
 */

/* ---------- Config ---------- */
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/* ---------- Module scoped caches ---------- */
const inFlightRequests = new Map(); // taskId -> Promise
const insightsCache = new Map(); // taskId -> { insights, ts }

/* ---------- Helpers ---------- */
function isCacheValid(entry) {
  if (!entry) return false;
  return (Date.now() - entry.ts) < CACHE_TTL_MS;
}

function safeGetTaskId(task) {
  return task?.id ?? null;
}

function fingerprintArrayByIdAndStatus(arr = []) {
  return arr.map(t => `${t.id ?? ''}:${t.status ?? ''}`).join('|');
}

/* ---------- Component ---------- */
function InsightsComponent({
  currentTaskDetails,
  currentJob,
  tasks = [],
  jobs = [],
  stickyNotes = []
}) {
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [lastError, setLastError] = useState(null);
  const { generateTaskInsights, getCachedInsights } = useAIInsights() || {};

  // Track whether we've already attempted an automatic fetch for this task.
  // This prevents automatic retry loops. Manual refresh bypasses this.
  const attemptedAutoFetchRef = useRef(false);
  const taskId = safeGetTaskId(currentTaskDetails);
  const company = currentJob?.company ?? 'Unknown Company';

  // Cheap fingerprints to avoid effect triggers from re-created array objects
  const tasksFp = useMemo(() => fingerprintArrayByIdAndStatus(tasks), [tasks]);
  const jobsFp = useMemo(() => fingerprintArrayByIdAndStatus(jobs), [jobs]);
  const stickyCount = stickyNotes?.length ?? 0;

  // Reset attempted flag when task changes so a new task gets one automatic attempt
  useEffect(() => {
    attemptedAutoFetchRef.current = false;
  }, [taskId]);

  // Main fetcher. `manual=true` bypasses the no-auto-retry guard.
  const fetchInsightsForTask = async ({ force = false, manual = false } = {}) => {
    if (!taskId) {
      setAiInsights(null);
      return null;
    }

    // If not forced and cache valid, use it
    const cacheEntry = insightsCache.get(taskId);
    if (!force && isCacheValid(cacheEntry)) {
      setAiInsights(cacheEntry.insights);
      return cacheEntry.insights;
    }

    // Try context cache (if available) once
    if (!force && typeof getCachedInsights === 'function') {
      try {
        const ctxCached = await Promise.resolve(getCachedInsights(taskId));
        if (ctxCached) {
          insightsCache.set(taskId, { insights: ctxCached, ts: Date.now() });
          setAiInsights(ctxCached);
          return ctxCached;
        }
      } catch (err) {
        // ignore context cache error, but do not retry automatically
        console.warn('getCachedInsights failed:', err);
      }
    }

    // Automatic attempts: only once per task unless 'manual' is true
    if (!manual && attemptedAutoFetchRef.current && !force) {
      // Do not retry automatically — return current state
      return aiInsights;
    }

    // Dedupe concurrent calls
    if (inFlightRequests.has(taskId)) {
      try {
        setGeneratingInsights(true);
        const result = await inFlightRequests.get(taskId);
        if (result) {
          insightsCache.set(taskId, { insights: result, ts: Date.now() });
          setAiInsights(result);
        }
        // mark that we've attempted (so subsequent automatic triggers won't retry)
        attemptedAutoFetchRef.current = true;
        return result;
      } catch (err) {
        // If the shared promise failed, we do NOT retry automatically.
        attemptedAutoFetchRef.current = true;
        setLastError(err);
        setGeneratingInsights(false);
        const fallback = {
          whatWasDone: ["Error generating insights"],
          whatNeedsToBeNext: ["Please try refresh manually"],
          estimatedTimeLeft: "Unknown",
          blockers: ["AI service issue"],
          progress: currentTaskDetails?.status === 'done' ? 100 : 50
        };
        setAiInsights(fallback);
        return fallback;
      }
    }

    // Build a single promise and register it
    const promise = (async () => {
      try {
        if (typeof generateTaskInsights !== 'function') {
          return {
            whatWasDone: ["AI insights unavailable"],
            whatNeedsToBeNext: ["Enable AI Insights service"],
            estimatedTimeLeft: "Unknown",
            blockers: [],
            progress: currentTaskDetails?.status === 'done' ? 100 : 0
          };
        }

        const companyTasks = tasks.filter(t => {
          const taskJob = jobs.find(j => j.id === t.jobId);
          return taskJob && taskJob.company === company;
        });

        const previousTasks = companyTasks.filter(t => t.status === 'done' && t.id !== currentTaskDetails?.id);

        const insights = await generateTaskInsights(
          currentTaskDetails,
          company,
          previousTasks,
          stickyNotes
        );

        return insights;
      } catch (err) {
        console.error('Error generating insights:', err);
        throw err;
      }
    })();

    inFlightRequests.set(taskId, promise);
    setGeneratingInsights(true);
    setLastError(null);

    try {
      const result = await promise;
      insightsCache.set(taskId, { insights: result, ts: Date.now() });
      setAiInsights(result);
      return result;
    } catch (err) {
      // IMPORTANT: do NOT retry automatically — mark attempted and set fallback
      attemptedAutoFetchRef.current = true;
      setLastError(err);
      const fallback = {
        whatWasDone: ["Error generating insights"],
        whatNeedsToBeNext: ["Please try refresh manually"],
        estimatedTimeLeft: "Unknown",
        blockers: ["AI service issue"],
        progress: currentTaskDetails?.status === 'done' ? 100 : 50
      };
      setAiInsights(fallback);
      return fallback;
    } finally {
      inFlightRequests.delete(taskId);
      setGeneratingInsights(false);
    }
  };

  // Automatic single attempt on mount / when task changes (no retries)
  useEffect(() => {
    let cancelled = false;
    if (!taskId) {
      setAiInsights(null);
      return;
    }

    // Only fire automatic fetch if we haven't attempted before for this task
    if (!attemptedAutoFetchRef.current) {
      (async () => {
        if (cancelled) return;
        await fetchInsightsForTask({ force: false, manual: false });
        // mark that we attempted automatic fetch regardless of success/failure
        attemptedAutoFetchRef.current = true;
      })();
    }

    return () => {
      cancelled = true;
    };
    // Minimal deps so this doesn't retrigger unnecessarily
  }, [taskId, company, /* fingerprints removed to avoid rebuild triggers */]);

  // Manual refresh (explicit user action) — bypasses the "no auto-retry" guard
  const handleRefresh = async () => {
    await fetchInsightsForTask({ force: true, manual: true });
    // after manual refresh, mark attempted so it doesn't cause further auto retries
    attemptedAutoFetchRef.current = true;
  };

  // Safe accessors
  const whatWasDone = aiInsights?.whatWasDone ?? [];
  const whatNeedsToBeNext = aiInsights?.whatNeedsToBeNext ?? [];
  const estimatedTimeLeft = aiInsights?.estimatedTimeLeft ?? 'Unknown';
  const blockers = aiInsights?.blockers ?? [];
  const progress = typeof aiInsights?.progress === 'number' ? aiInsights.progress : 0;

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      {generatingInsights ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500 animate-pulse" />
            <span>Generating AI insights...</span>
          </div>
        </div>
      ) : aiInsights ? (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-600" />
                What Was Accomplished
              </h6>
              <ul className="text-sm text-gray-600 space-y-1">
                {whatWasDone.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
                {whatWasDone.length === 0 && <li className="text-xs text-gray-400">No accomplishments detected.</li>}
              </ul>
            </div>

            <div>
              <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-600" />
                Recommended Next Steps
              </h6>
              <ul className="text-sm text-gray-600 space-y-1">
                {whatNeedsToBeNext.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
                {whatNeedsToBeNext.length === 0 && <li className="text-xs text-gray-400">No recommendations available.</li>}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Progress:</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                  ></div>
                </div>
                <span className="ml-2 font-medium text-gray-800">
                  {Math.min(Math.max(progress, 0), 100)}%
                </span>
              </div>
              <div className="text-gray-600">
                Est. time left: {estimatedTimeLeft}
              </div>
            </div>

            {blockers && blockers.length > 0 && (
              <div className="mt-2">
                <span className="text-red-600 text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Potential Blockers:
                </span>
                <ul className="text-sm text-red-600 ml-5">
                  {blockers.map((blocker, idx) => (
                    <li key={idx}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 flex gap-2 items-center">
              <button
                onClick={handleRefresh}
                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                title="Force refresh insights (manual)"
              >
                Refresh
              </button>

              {lastError && (
                <div className="text-xs text-red-600">Error fetching insights — no automatic retries performed.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Unable to load insights
        </div>
      )}
    </div>
  );
}

export default React.memo(InsightsComponent);
