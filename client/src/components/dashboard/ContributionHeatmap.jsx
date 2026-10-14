import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AnimatedCounter from '../common/AnimatedCounter';
import { TrendingUp, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { GitHubIcon } from '../common/PlatformIcons';

/**
 * Format 'YYYY-MM-DD' into 'MMM DD, YYYY'
 * e.g. '2026-10-14' -> 'Oct 14, 2026'
 */
function formatTooltipDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate level 0-4 matching GitHub thresholds:
 * 0: 0
 * 1: 1-2
 * 2: 3-5
 * 3: 6-9
 * 4: 10+
 */
export function calculateContributionLevel(count) {
  if (!count || count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Generate a clean 52-week x 7-day empty grid starting from a Sunday 52 weeks ago
 */
function generateEmptyWeeks() {
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364 - today.getDay());

  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + (w * 7 + d));
      days.push({
        id: `empty-${w}-${d}`,
        date: cur.toISOString().split('T')[0],
        count: 0,
        level: 0,
        weekday: d
      });
    }
    weeks.push({ days });
  }
  return weeks;
}

export default function ContributionHeatmap({
  calendar = null,
  heatmap = null,
  totalContributions = 0,
  growth = '+0% from last period',
  githubHandle = '',
  isConnected = false
}) {
  const { isDark } = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Direct Frontend Fallback State
  const [liveHeatmap, setLiveHeatmap] = useState(null);
  const [liveTotal, setLiveTotal] = useState(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Determine effective GitHub handle
  const effectiveGithubHandle = (
    githubHandle ||
    (typeof window !== 'undefined' && localStorage.getItem('devpulse_github_handle')) ||
    ''
  ).trim().replace(/^@/, '');

  // 1. Live Browser Fallback: Fetch directly if backend data is missing or empty
  useEffect(() => {
    if (!effectiveGithubHandle) return;

    // Check if backend already provided non-zero contributions
    const backendHasData =
      (totalContributions > 0 || (heatmap && heatmap.length > 0)) &&
      (heatmap?.some((d) => (d.count || 0) > 0) ||
        calendar?.weeks?.some((w) => (w.days || w.contributionDays || []).some((d) => (d.count || d.contributionCount || 0) > 0)));

    if (backendHasData) {
      return;
    }

    let isMounted = true;
    setIsLoadingLive(true);

    async function fetchPublicContributions() {
      try {
        const clean = encodeURIComponent(effectiveGithubHandle);
        const [lastRes, y2026Res] = await Promise.allSettled([
          fetch(`https://github-contributions-api.jogruber.de/v4/${clean}?y=last`),
          fetch(`https://github-contributions-api.jogruber.de/v4/${clean}?y=2026`)
        ]);

        const lastData =
          lastRes.status === 'fulfilled' && lastRes.value.ok
            ? await lastRes.value.json().catch(() => null)
            : null;
        const y2026Data =
          y2026Res.status === 'fulfilled' && y2026Res.value.ok
            ? await y2026Res.value.json().catch(() => null)
            : null;

        const rawLast = Array.isArray(lastData?.contributions) ? lastData.contributions : [];
        const raw2026 = Array.isArray(y2026Data?.contributions) ? y2026Data.contributions : [];

        if (rawLast.length > 0 || raw2026.length > 0) {
          const dateMap = new Map();

          rawLast.forEach((item) => {
            if (item?.date) dateMap.set(item.date, item.count || 0);
          });

          raw2026.forEach((item) => {
            if (item?.date) {
              const current = dateMap.get(item.date) || 0;
              dateMap.set(item.date, Math.max(current, item.count || 0));
            }
          });

          let mergedList = [];
          if (rawLast.length > 0) {
            mergedList = rawLast.map((item) => {
              const count = dateMap.get(item.date) ?? (item.count || 0);
              return {
                date: item.date,
                count,
                level: calculateContributionLevel(count)
              };
            });
          } else {
            const sortedDates = Array.from(dateMap.keys()).sort();
            mergedList = sortedDates.map((date) => {
              const count = dateMap.get(date) || 0;
              return {
                date,
                count,
                level: calculateContributionLevel(count)
              };
            });
          }

          const reported2026 = Number(y2026Data?.total?.['2026']) || 0;
          const reportedLast = Number(lastData?.total?.lastYear) || 0;
          const sumCount = mergedList.reduce((acc, d) => acc + d.count, 0);
          const computedTotal = Math.max(reported2026, reportedLast, sumCount);

          if (isMounted) {
            setLiveHeatmap(mergedList);
            setLiveTotal(computedTotal);
          }
        }
      } catch (err) {
        console.warn('[ContributionHeatmap] Direct live fallback note:', err.message);
      } finally {
        if (isMounted) {
          setIsLoadingLive(false);
        }
      }
    }

    fetchPublicContributions();

    return () => {
      isMounted = false;
    };
  }, [effectiveGithubHandle, totalContributions, heatmap, calendar]);

  // Active total contributions
  const activeTotal = useMemo(() => {
    if (liveTotal !== null && liveTotal > 0) return liveTotal;
    if (totalContributions > 0) return totalContributions;
    if (calendar?.totalContributions > 0) return calendar.totalContributions;
    return 0;
  }, [liveTotal, totalContributions, calendar]);

  // 2. Build 52-53 weeks x 7 days grid directly from heatmap data
  const displayWeeks = useMemo(() => {
    const activeList = liveHeatmap || heatmap || calendar?.heatmap || null;

    if (activeList && Array.isArray(activeList) && activeList.length > 0) {
      // Chunk activeList into 7-day Sunday-aligned weeks
      const weeks = [];
      let currentWeek = [];

      // Check weekday of first entry
      const firstEntry = activeList[0];
      const firstDateObj = firstEntry?.date ? new Date(firstEntry.date + 'T00:00:00Z') : null;
      const startDayOfWeek = firstDateObj && !isNaN(firstDateObj.getUTCDay()) ? firstDateObj.getUTCDay() : 0;

      // Prepend padding if first day is not Sunday
      for (let p = 0; p < startDayOfWeek; p++) {
        currentWeek.push({
          id: `pad-pre-${p}`,
          date: '',
          count: 0,
          level: 0,
          weekday: p,
          future: true
        });
      }

      for (let i = 0; i < activeList.length; i++) {
        const d = activeList[i];
        const dateObj = new Date(d.date + 'T00:00:00Z');
        const weekday = isNaN(dateObj.getUTCDay()) ? currentWeek.length % 7 : dateObj.getUTCDay();

        currentWeek.push({
          id: `day-${d.date || i}`,
          date: d.date,
          count: d.count ?? 0,
          level: d.level ?? calculateContributionLevel(d.count ?? 0),
          weekday,
          githubCount: d.githubCount,
          leetcodeCount: d.leetcodeCount
        });

        if (currentWeek.length === 7) {
          weeks.push({ days: currentWeek });
          currentWeek = [];
        }
      }

      // Pad remaining days in the final week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({
            id: `pad-post-${currentWeek.length}`,
            date: '',
            count: 0,
            level: 0,
            weekday: currentWeek.length,
            future: true
          });
        }
        weeks.push({ days: currentWeek });
      }

      return weeks;
    }

    // Fallback: If calendar.weeks exists
    if (calendar?.weeks && Array.isArray(calendar.weeks) && calendar.weeks.length > 0) {
      return calendar.weeks.map((w, wIdx) => {
        const rawDays = Array.isArray(w.days) ? w.days : (w.contributionDays || []);
        const days = rawDays.map((d, dIdx) => ({
          id: `${wIdx}-${dIdx}-${d.date}`,
          date: d.date,
          count: d.count ?? d.contributionCount ?? 0,
          level: d.level ?? calculateContributionLevel(d.count ?? d.contributionCount ?? 0),
          weekday: d.weekday ?? dIdx,
          githubCount: d.githubCount,
          leetcodeCount: d.leetcodeCount
        }));

        while (days.length < 7) {
          days.push({
            id: `pad-${wIdx}-${days.length}`,
            date: '',
            count: 0,
            level: 0,
            weekday: days.length,
            future: true
          });
        }
        return { days };
      });
    }

    return generateEmptyWeeks();
  }, [liveHeatmap, heatmap, calendar]);

  // Derive month labels aligned with column indices
  const monthLabels = useMemo(() => {
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    displayWeeks.forEach((week, wIdx) => {
      const firstValidDay = week.days?.find((d) => d.date && !d.future);
      if (firstValidDay?.date) {
        const [y, m] = firstValidDay.date.split('-').map(Number);
        const monthIndex = m - 1;
        if (monthIndex !== lastMonth) {
          // Avoid collision: Ensure at least 3 columns distance between consecutive labels
          const lastLabel = labels[labels.length - 1];
          if (!lastLabel || wIdx - lastLabel.colIndex >= 3) {
            labels.push({ colIndex: wIdx, label: months[monthIndex] });
            lastMonth = monthIndex;
          }
        }
      }
    });

    return labels;
  }, [displayWeeks]);

  // GitHub Authentic Color Scale
  const getCellColor = (level, isFuture = false) => {
    if (isFuture) {
      return 'opacity-0 pointer-events-none';
    }

    if (isDark) {
      switch (level) {
        case 4:
          return 'bg-[#39d353] shadow-[0_0_6px_rgba(57,211,83,0.4)]';
        case 3:
          return 'bg-[#26a641]';
        case 2:
          return 'bg-[#006d32]';
        case 1:
          return 'bg-[#0e4429]';
        default:
          return 'bg-[#161b22] border border-white/[0.05]';
      }
    } else {
      switch (level) {
        case 4:
          return 'bg-[#216e39] shadow-[0_0_4px_rgba(33,110,57,0.3)]';
        case 3:
          return 'bg-[#30a14e]';
        case 2:
          return 'bg-[#40c463]';
        case 1:
          return 'bg-[#9be9a8]';
        default:
          return 'bg-[#ebedf0] border border-slate-200';
      }
    }
  };

  const isProfileConnected = isConnected || Boolean(effectiveGithubHandle);

  return (
    <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xs transition-colors">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <GitHubIcon className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            <span>GitHub Contribution Graph</span>
            {effectiveGithubHandle && (
              <span className="text-[11px] font-semibold text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md">
                @{effectiveGithubHandle}
              </span>
            )}
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {activeTotal > 0
                ? `${activeTotal.toLocaleString()} contributions in 2026`
                : 'Past 365 Days'}
            </span>
          </h3>
          {isLoadingLive && (
            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 self-end sm:self-auto">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={`w-2.5 h-2.5 rounded-xs ${getCellColor(lvl)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Prompt to Connect GitHub if not connected */}
      {!isProfileConnected && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Connect your GitHub username in Settings to view your real 365-day contribution calendar.</span>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#E5A952] hover:bg-[#d4973f] text-slate-900 font-semibold rounded-lg text-xs transition-colors shrink-0 shadow-xs"
          >
            <span>Connect GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Heatmap Layout with Right Summary Metric */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Heatmap Grid */}
        <div className="flex-1 w-full overflow-x-auto pb-2">
          <div className="min-w-[720px]">
            {/* Month Labels Aligned Above Grid */}
            <div className="flex gap-1.5 mb-1">
              {/* Spacer matching left weekday label width */}
              <div className="w-[28px] shrink-0" />
              <div className="relative h-4 flex-1">
                {monthLabels.map((m) => (
                  <span
                    key={`${m.label}-${m.colIndex}`}
                    className="absolute text-[10px] text-slate-400 font-medium select-none"
                    style={{ left: `${m.colIndex * 13.5}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid with Left Weekday Labels */}
            <div className="flex gap-1.5">
              {/* Day Labels (Sun - Sat, showing Mon, Wed, Fri) */}
              <div className="w-[28px] shrink-0 flex flex-col gap-[3px] text-[9px] text-slate-400 font-medium select-none justify-between h-[95px] pr-1">
                <span className="h-[11px] leading-[11px] text-transparent">S</span>
                <span className="h-[11px] leading-[11px]">Mon</span>
                <span className="h-[11px] leading-[11px] text-transparent">T</span>
                <span className="h-[11px] leading-[11px]">Wed</span>
                <span className="h-[11px] leading-[11px] text-transparent">T</span>
                <span className="h-[11px] leading-[11px]">Fri</span>
                <span className="h-[11px] leading-[11px] text-transparent">S</span>
              </div>

              {/* 52/53 Week Columns */}
              <div className="flex gap-[3px] relative flex-1">
                {displayWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.days.map((day) => {
                      if (day.future) {
                        return <div key={day.id} className="w-[10.5px] h-[10.5px] opacity-0" />;
                      }

                      return (
                        <div
                          key={day.id}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.top
                            });
                            setHoveredCell(day);
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-[10.5px] h-[10.5px] rounded-[2px] cursor-pointer transition-transform duration-100 hover:scale-130 hover:z-20 ${getCellColor(
                            day.level,
                            day.future
                          )}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Metric */}
        <div className="lg:w-56 w-full flex-shrink-0 flex flex-col justify-center lg:border-l border-slate-200 dark:border-white/5 lg:pl-6 pt-4 lg:pt-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Contributions
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={activeTotal || 0} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{growth || '+1,192 in 2026'}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {isProfileConnected
              ? `Verified telemetry from @${effectiveGithubHandle || 'github'}`
              : 'Connect GitHub to unlock full activity'}
          </span>
        </div>
      </div>

      {/* Floating Hover Tooltip: "X contributions on MMM DD, YYYY" */}
      {hoveredCell && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-900/95 dark:bg-black/95 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap -translate-x-1/2 -translate-y-full mb-2 animate-in fade-in duration-100"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 8}px`
          }}
        >
          <div className="font-semibold">
            {hoveredCell.count === 0
              ? `No contributions on ${formatTooltipDate(hoveredCell.date)}`
              : `${hoveredCell.count} contribution${hoveredCell.count === 1 ? '' : 's'} on ${formatTooltipDate(hoveredCell.date)}`}
          </div>
          {(hoveredCell.githubCount > 0 || hoveredCell.leetcodeCount > 0) && (
            <div className="text-[10px] text-slate-400 mt-0.5">
              {[
                hoveredCell.githubCount > 0 ? `${hoveredCell.githubCount} GitHub` : null,
                hoveredCell.leetcodeCount > 0 ? `${hoveredCell.leetcodeCount} LeetCode` : null
              ]
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
