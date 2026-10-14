import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DevPulseLogo from '../components/common/DevPulseLogo';
import ThemeToggle from '../components/common/ThemeToggle';
import { api } from '../services/api';
import {
  ExternalLink,
  Star,
  GitFork,
  ArrowLeft,
  Sparkles,
  MapPin,
  GraduationCap,
  FolderGit2,
  Calendar,
  Code2,
  Award,
  Globe
} from 'lucide-react';
import { GitHubIcon, LeetCodeIcon } from '../components/common/PlatformIcons';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPublicProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.portfolio.getPublic(username || 'developer');
        if (res.success && res.user) {
          setProfileData(res.user);
          setProjects(res.projects || []);
        } else {
          // Fallback to me
          const meRes = await api.portfolio.getMe();
          if (meRes.profile) {
            setProfileData({ ...meRes.profile, stats: meRes.stats });
            setProjects([...(meRes.customProjects || []), ...(meRes.featuredRepos || [])]);
          } else {
            setError(res.message || 'Developer profile not found');
          }
        }
      } catch (err) {
        console.error('Failed to load public portfolio:', err);
        setError('Developer portfolio could not be retrieved.');
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading developer portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-[#151922] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || `The requested profile for @${username} does not exist or has not been configured yet.`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to DevPulse</span>
          </Link>
        </div>
      </div>
    );
  }

  const stats = profileData.stats || {};

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to DevPulse</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] shadow-xs"
            >
              Build your DevPulse profile
            </Link>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/30 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-600 font-black text-2xl flex items-center justify-center shrink-0">
                {(profileData.name || 'D').charAt(0)}
              </div>
            )}

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
                  {profileData.name}
                </h1>
                <span className="text-xs font-mono text-slate-400">
                  @{profileData.username || username}
                </span>
                <span className="text-blue-500 text-sm">✓ Verified Developer</span>
              </div>

              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {profileData.role || 'Full Stack & AI Developer'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                {profileData.college && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profileData.college}</span>
                  </span>
                )}
                {profileData.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profileData.location}</span>
                  </span>
                )}
              </div>

              {profileData.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {profileData.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {profileData.githubUrl && (
                  <a
                    href={profileData.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 font-medium"
                  >
                    <GitHubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profileData.leetcodeUrl && (
                  <a
                    href={profileData.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 font-medium"
                  >
                    <LeetCodeIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>LeetCode</span>
                  </a>
                )}
                {profileData.linkedinUrl && (
                  <a
                    href={profileData.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
            <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalRepositories ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Repositories</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.problemsSolved ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Problems Solved</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.currentStreak ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Active Day Streak</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.rating ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Developer Rating</p>
            </div>
          </div>
        </div>

        {/* Featured Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Featured Engineering Projects</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <span className="text-xs text-slate-400">
              {projects.length} Verified Repositories
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-8 rounded-3xl text-center text-xs text-slate-500">
              No featured projects published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => {
                const isCustom = proj.isCustom;
                const exploreUrl = proj.githubUrl || proj.demoUrl || '#';

                return (
                  <div
                    key={proj.id || proj._id}
                    className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isCustom
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                        }`}>
                          {isCustom ? <Sparkles className="w-3 h-3" /> : <GitHubIcon className="w-3 h-3" />}
                          <span>{isCustom ? 'Custom Project' : 'GitHub'}</span>
                        </span>

                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                          {(proj.stars || 0) > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-400" />
                              <span>{proj.stars}</span>
                            </span>
                          )}
                          {(proj.forks || 0) > 0 && (
                            <span className="flex items-center gap-0.5">
                              <GitFork className="w-3 h-3" />
                              <span>{proj.forks}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {proj.title || proj.name}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {proj.description || 'Public software engineering codebase.'}
                      </p>

                      {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.tags.map(t => (
                            <span
                              key={t}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                      {proj.demoUrl ? (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Live Demo</span>
                        </a>
                      ) : <span />}

                      {exploreUrl !== '#' && (
                        <a
                          href={exploreUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Explore Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
