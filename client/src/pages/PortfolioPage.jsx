import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Edit3,
  Share2,
  Download,
  Plus,
  ExternalLink,
  Star,
  GitFork,
  X,
  Code2,
  Award,
  Zap,
  Activity,
  Check,
  Trash2,
  Layers,
  FolderGit2,
  Lock,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
  GraduationCap,
  Globe,
  Search,
  Filter
} from 'lucide-react';
import { GitHubIcon, LeetCodeIcon } from '../components/common/PlatformIcons';

export default function PortfolioPage() {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [customProjects, setCustomProjects] = useState([]);
  const [featuredRepos, setFeaturedRepos] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Filters & Search
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilterType, setProjectFilterType] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [githubSyncHandle, setGithubSyncHandle] = useState('');
  const [isSyncingGH, setIsSyncingGH] = useState(false);

  // Edit Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    role: '',
    college: '',
    bio: '',
    location: '',
    githubUrl: '',
    leetcodeUrl: '',
    linkedinUrl: ''
  });

  // Project Form state (Add / Edit)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: 'React, Node.js, TypeScript',
    demoUrl: '',
    githubUrl: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Real Portfolio Telemetry from Backend
  const loadPortfolioData = async () => {
    setIsLoading(true);
    try {
      const res = await api.portfolio.getMe();
      if (res.success) {
        setProfile(res.profile || {});
        setStats(res.stats || {});
        setCustomProjects(res.customProjects || []);
        setFeaturedRepos(res.featuredRepos || []);
        setAllRepos(res.allRepos || []);

        const prof = res.profile || {};
        setProfileForm({
          name: prof.name || authUser?.name || 'Developer',
          username: prof.username || (authUser?.email ? authUser.email.split('@')[0] : 'developer'),
          role: prof.role || authUser?.role || 'Full Stack & AI Developer',
          college: prof.college || authUser?.college || '',
          bio: prof.bio || authUser?.bio || '',
          location: prof.location || '',
          githubUrl: prof.githubUrl || '',
          leetcodeUrl: prof.leetcodeUrl || '',
          linkedinUrl: prof.linkedinUrl || ''
        });

        if (prof.githubUrl && !githubSyncHandle) {
          const parts = prof.githubUrl.split('/');
          setGithubSyncHandle(parts[parts.length - 1] || '');
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, [authUser]);

  // Combined Projects (Custom + Featured Repos)
  const allCombinedProjects = useMemo(() => {
    return [...customProjects, ...featuredRepos];
  }, [customProjects, featuredRepos]);

  // Filtered Projects for Projects Tab
  const filteredProjects = useMemo(() => {
    return allCombinedProjects.filter(p => {
      const title = (p.title || p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const query = projectSearch.toLowerCase();
      const matchesSearch = title.includes(query) || desc.includes(query);

      if (projectFilterType === 'Custom') return matchesSearch && p.isCustom;
      if (projectFilterType === 'GitHub') return matchesSearch && !p.isCustom;
      return matchesSearch;
    });
  }, [allCombinedProjects, projectSearch, projectFilterType]);

  // Share Profile Handler
  const handleShare = () => {
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    const userSlug = profile?.username || profileForm.username || (profile?.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'developer');
    const shareUrl = `${window.location.origin}/u/${userSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setIsShareModalOpen(true);
    showToast('Public profile link copied to clipboard!');
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.portfolio.updateProfile(profileForm);
      if (res.success) {
        setProfile(prev => ({ ...prev, ...profileForm }));
        if (updateUser) {
          updateUser(profileForm);
        }
        setIsEditProfileOpen(false);
        showToast('Profile updated successfully!');
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  // Add Custom Project Handler
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    try {
      const res = await api.portfolio.createProject(projectForm);
      if (res.success && res.project) {
        setCustomProjects(prev => [res.project, ...prev]);
        setIsAddModalOpen(false);
        setProjectForm({ title: '', description: '', tags: 'React, Node.js, TypeScript', demoUrl: '', githubUrl: '' });
        confetti({ particleCount: 50, spread: 60 });
        showToast('Project added to portfolio!');
        loadPortfolioData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create project');
    }
  };

  // Open Edit Project Modal
  const handleOpenEditProject = (proj, e) => {
    e.stopPropagation();
    setEditingProject(proj);
    setProjectForm({
      title: proj.title || proj.name || '',
      description: proj.description || '',
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || ''),
      demoUrl: proj.demoUrl || '',
      githubUrl: proj.githubUrl || ''
    });
    setIsEditProjectModalOpen(true);
  };

  // Update Custom Project Handler
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject || !projectForm.title.trim()) return;

    try {
      const projId = editingProject.id || editingProject._id;
      const res = await api.portfolio.updateProject(projId, projectForm);
      if (res.success) {
        setIsEditProjectModalOpen(false);
        setEditingProject(null);
        showToast('Project updated successfully!');
        loadPortfolioData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update project');
    }
  };

  // Delete Custom Project Handler
  const handleDeleteProject = async (proj, e) => {
    e.stopPropagation();
    const projId = proj.id || proj._id;
    if (!window.confirm(`Delete project "${proj.title || proj.name}"?`)) return;

    try {
      await api.portfolio.deleteProject(projId);
      setCustomProjects(prev => prev.filter(p => (p.id || p._id) !== projId));
      if (selectedProject && (selectedProject.id || selectedProject._id) === projId) {
        setSelectedProject(null);
      }
      showToast('Project deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  // Import from GitHub Handler
  const handleQuickGitHubSync = async (e) => {
    e.preventDefault();
    if (!githubSyncHandle.trim()) return;
    setIsSyncingGH(true);
    try {
      const res = await api.repositories.sync(githubSyncHandle.trim());
      setIsImportModalOpen(false);
      confetti({ particleCount: 60, spread: 60 });
      showToast(res.message || 'Imported repositories from GitHub!');
      loadPortfolioData();
    } catch (err) {
      alert(err.message || 'Failed to sync GitHub account');
    } finally {
      setIsSyncingGH(false);
    }
  };

  // Dynamic Badges & Achievements
  const achievements = useMemo(() => {
    const repos = stats.totalRepos ?? authUser?.stats?.totalRepositories ?? 0;
    const problems = stats.leetcodeSolved ?? authUser?.stats?.problemsSolved ?? 0;
    const streak = stats.currentStreak ?? authUser?.stats?.currentStreak ?? 0;
    const contributions = stats.totalContributions ?? authUser?.stats?.totalContributions ?? 0;
    const rating = stats.rating ?? authUser?.stats?.rating ?? 0;

    const allBadges = [
      {
        id: 'ach_repo',
        title: 'First Repository Connected',
        description: 'Successfully connected and verified a developer codebase on GitHub.',
        icon: FolderGit2,
        isUnlocked: repos >= 1,
        progress: `${Math.min(repos, 1)} / 1 Repo`,
        category: 'GitHub'
      },
      {
        id: 'ach_10',
        title: '10+ Problems Solved',
        description: 'Completed at least 10 algorithmic problem solutions.',
        icon: Award,
        isUnlocked: problems >= 10,
        progress: `${problems} / 10 Solved`,
        category: 'Problem Solving'
      },
      {
        id: 'ach_50',
        title: '50+ Problems Solved',
        description: 'Completed 50 algorithmic challenges, building strong DSA fundamentals.',
        icon: Award,
        isUnlocked: problems >= 50,
        progress: `${problems} / 50 Solved`,
        category: 'Problem Solving'
      },
      {
        id: 'ach_100',
        title: '100+ Problems Solved',
        description: 'Crossed the triple-digit milestone of verified algorithmic solutions.',
        icon: Award,
        isUnlocked: problems >= 100,
        progress: `${problems} / 100 Solved`,
        category: 'Problem Solving'
      },
      {
        id: 'ach_7d',
        title: '7-Day Streak',
        description: 'Maintained uninterrupted coding consistency for a full week.',
        icon: Zap,
        isUnlocked: streak >= 7,
        progress: `${streak} / 7 Days`,
        category: 'Consistency'
      },
      {
        id: 'ach_30d',
        title: '30-Day Streak',
        description: 'Demonstrated exceptional dedication with 30 consecutive active days.',
        icon: Zap,
        isUnlocked: streak >= 30,
        progress: `${streak} / 30 Days`,
        category: 'Consistency'
      },
      {
        id: 'ach_contrib',
        title: 'Active Open Source Contributor',
        description: 'Accumulated 50+ recorded commits, contributions, and platform events.',
        icon: GitHubIcon,
        isUnlocked: contributions >= 50,
        progress: `${contributions} / 50 Contributions`,
        category: 'Open Source'
      },
      {
        id: 'ach_rating_1500',
        title: 'Competitive Rating 1500+',
        description: 'Attained a calculated DevPulse developer rating exceeding 1500 points.',
        icon: Star,
        isUnlocked: rating >= 1500,
        progress: `${rating} / 1500 Rating`,
        category: 'Rating'
      }
    ];

    return {
      all: allBadges,
      unlocked: allBadges.filter(b => b.isUnlocked),
      locked: allBadges.filter(b => !b.isUnlocked)
    };
  }, [stats, authUser]);

  // Dynamic Skills Calculator
  const skillsList = useMemo(() => {
    const list = [];
    const seen = new Set();

    // From Repos
    allRepos.forEach(r => {
      if (r.language && r.language !== 'Other' && !seen.has(r.language.toLowerCase())) {
        seen.add(r.language.toLowerCase());
        list.push({
          name: r.language,
          category: 'Programming Language',
          detail: 'Used in Repositories'
        });
      }
    });

    // From Custom Projects
    customProjects.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          if (tag && !seen.has(tag.toLowerCase())) {
            seen.add(tag.toLowerCase());
            list.push({
              name: tag,
              category: 'Full Stack Tech',
              detail: 'Used in Custom Projects'
            });
          }
        });
      }
    });

    return list;
  }, [allRepos, customProjects]);

  // Dynamic Activity Stream
  const activityList = useMemo(() => {
    const list = [];

    // Recent Repos
    allRepos.slice(0, 5).forEach((r, idx) => {
      list.push({
        id: `act_repo_${idx}`,
        icon: FolderGit2,
        color: 'text-amber-500',
        title: `Updated repository "${r.name}"`,
        detail: r.description || `Primary language: ${r.language || 'Code'}`,
        time: 'Synchronized'
      });
    });

    // Custom Projects
    customProjects.forEach(p => {
      list.push({
        id: `act_proj_${p.id || p._id}`,
        icon: Code2,
        color: 'text-emerald-500',
        title: `Added project "${p.title}"`,
        detail: p.description || 'Custom engineering addition',
        time: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Active'
      });
    });

    if (stats.leetcodeSolved) {
      list.push({
        id: 'act_lc_solved',
        icon: LeetCodeIcon,
        color: 'text-amber-500',
        title: `Synchronized ${stats.leetcodeSolved} LeetCode Problem Solutions`,
        detail: `Active streak: ${stats.currentStreak || 0} days`,
        time: 'Current Telemetry'
      });
    }

    return list;
  }, [allRepos, customProjects, stats]);

  const tabs = ['Overview', 'Projects', 'Achievements', 'Skills', 'Activity'];

  const publicProfileUrl = `${window.location.origin}/u/${profile?.username || profileForm.username || 'developer'}`;

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-medium text-xs shadow-2xl animate-in slide-in-from-bottom-3">
              <Check className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
                    {profile?.name || authUser?.name || 'Developer'}
                  </h1>
                  <span className="text-xs font-mono text-slate-400">
                    @{profile?.username || profileForm.username || 'developer'}
                  </span>
                  <span className="text-blue-500 text-base">✓</span>
                </div>

                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {profile?.role || authUser?.role || 'Full Stack & AI Developer'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {(profile?.college || authUser?.college) ? (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile?.college || authUser?.college}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="text-amber-500 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Institution
                    </button>
                  )}

                  {profile?.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed pt-1">
                  {profile?.bio || authUser?.bio || 'Building modern software systems, algorithmic solutions, and production applications.'}
                </p>

                {/* Social Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-500 font-medium"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile?.leetcodeUrl && (
                    <a
                      href={profile.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-500 font-medium"
                    >
                      <LeetCodeIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>LeetCode</span>
                    </a>
                  )}
                  {profile?.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-500 font-medium"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1C212D] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-amber-400/50 shadow-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit profile</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1C212D] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-amber-400/50 shadow-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Profile</span>
                </button>

                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] hover:opacity-90 shadow-xs transition-opacity"
                >
                  <span>View Public Card</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 4 Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="bg-slate-50 dark:bg-[#1C212D]/50 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalRepos ?? authUser?.stats?.totalRepositories ?? 0}
                </span>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Repositories</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C212D]/50 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stats.followers ?? authUser?.stats?.followers ?? 0}
                </span>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Followers</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C212D]/50 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stats.following ?? authUser?.stats?.following ?? 0}
                </span>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Following</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1C212D]/50 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stats.leetcodeSolved ?? authUser?.stats?.problemsSolved ?? 0}
                </span>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">LeetCode Solved</p>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW                                      */}
          {/* ==================================================== */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* Featured Projects Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Featured Engineering Projects</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Projects custom-added or pinned from your synchronized GitHub codebases.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-amber-400/30 transition-colors"
                  >
                    <GitHubIcon className="w-3.5 h-3.5" />
                    <span>Import from GitHub</span>
                  </button>
                </div>
              </div>

              {/* Grid of Projects */}
              {allCombinedProjects.length === 0 ? (
                <div className="bg-white dark:bg-[#151922] border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <FolderGit2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No featured projects added yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Add your best projects manually, or toggle "Feature on Portfolio" on the Repositories page to pin your GitHub repos here.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]"
                    >
                      + Add Custom Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCombinedProjects.map((proj) => {
                    const isCustom = proj.isCustom;
                    const exploreUrl = proj.githubUrl || proj.demoUrl || '#';

                    return (
                      <div
                        key={proj.id || proj._id}
                        onClick={() => setSelectedProject(proj)}
                        className="group bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs hover:border-amber-400/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Banner */}
                          <div className="h-28 w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                                isCustom
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-white/15 text-white border-white/20'
                              }`}>
                                {isCustom ? <Sparkles className="w-3 h-3" /> : <GitHubIcon className="w-3 h-3" />}
                                <span>{isCustom ? 'Custom Project' : 'GitHub Repo'}</span>
                              </span>

                              {isCustom && (
                                <div className="flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => handleOpenEditProject(proj, e)}
                                    title="Edit Project"
                                    className="p-1.5 bg-black/40 hover:bg-black/80 text-white rounded-lg transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteProject(proj, e)}
                                    title="Delete Project"
                                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <h3 className="text-base font-extrabold text-white truncate drop-shadow-sm">
                              {proj.title || proj.name}
                            </h3>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-2.5">
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                              {proj.description || 'Public engineering project repository.'}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {Array.isArray(proj.tags) && proj.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium">
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                              {proj.stars || 0}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <GitFork className="w-3.5 h-3.5" />
                              {proj.forks || 0}
                            </span>
                          </div>

                          {exploreUrl !== '#' ? (
                            <a
                              href={exploreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] text-[#C58B43] dark:text-[#E5A952] font-semibold hover:underline"
                            >
                              <span>Explore</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-[#C58B43] dark:text-[#E5A952] font-semibold">
                              Details →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PROJECTS                                      */}
          {/* ==================================================== */}
          {activeTab === 'Projects' && (
            <div className="space-y-6">
              {/* Search & Sub-filters */}
              <div className="bg-white dark:bg-[#151922] p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  {['All', 'Custom', 'GitHub'].map(type => (
                    <button
                      key={type}
                      onClick={() => setProjectFilterType(type)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                        projectFilterType === type
                          ? 'bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {type === 'All' ? 'All Projects' : type === 'Custom' ? 'Custom' : 'GitHub'}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="bg-white dark:bg-[#151922] p-8 rounded-2xl border border-slate-200 dark:border-white/5 text-center text-xs text-slate-400">
                  No projects match your current filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((proj) => {
                    const isCustom = proj.isCustom;
                    const exploreUrl = proj.githubUrl || proj.demoUrl || '#';

                    return (
                      <div
                        key={proj.id || proj._id}
                        className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isCustom
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                            }`}>
                              {isCustom ? 'Custom Project' : 'GitHub Repository'}
                            </span>

                            {isCustom && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleOpenEditProject(proj, e)}
                                  className="p-1 text-slate-400 hover:text-amber-500"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(proj, e)}
                                  className="p-1 text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {proj.title || proj.name}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {proj.description || 'Public software codebase.'}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {Array.isArray(proj.tags) && proj.tags.map(t => (
                              <span key={t} className="text-[10px] font-medium bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                          {proj.demoUrl && (
                            <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline flex items-center gap-1 text-[11px] font-semibold">
                              <Globe className="w-3 h-3" /> Demo
                            </a>
                          )}
                          {exploreUrl !== '#' && (
                            <a href={exploreUrl} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline flex items-center gap-1 text-[11px] font-semibold ml-auto">
                              <span>Explore</span>
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
          )}

          {/* ==================================================== */}
          {/* TAB 3: ACHIEVEMENTS                                  */}
          {/* ==================================================== */}
          {activeTab === 'Achievements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Achievements & Dynamic Badges</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated dynamically from verified database stats ({achievements.unlocked.length} of {achievements.all.length} unlocked).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.all.map((ach) => {
                  const IconComp = ach.icon || Award;
                  return (
                    <div
                      key={ach.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        ach.isUnlocked
                          ? 'bg-white dark:bg-[#151922] border-amber-400/40 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-3 rounded-2xl shrink-0 ${
                          ach.isUnlocked
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-slate-200/60 dark:bg-white/5 text-slate-400'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {ach.title}
                            </h4>
                            {ach.isUnlocked ? (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                                UNLOCKED
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                                <Lock className="w-3 h-3" />
                                <span>LOCKED</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {ach.description}
                          </p>

                          <div className="pt-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                            {ach.progress}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: SKILLS                                        */}
          {/* ==================================================== */}
          {activeTab === 'Skills' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Verified Skill Badges</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Extracted dynamically from your synchronized GitHub codebases and projects.
                </p>
              </div>

              {skillsList.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No skills verified yet</p>
                  <p className="text-xs text-slate-400">Sync your GitHub codebases or add custom projects to extract tags.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {skillsList.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {skill.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                          {skill.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: ACTIVITY                                      */}
          {/* ==================================================== */}
          {activeTab === 'Activity' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Latest Telemetry & Activity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real platform synchronization events, code updates, and verified problem solving records.
                </p>
              </div>

              {activityList.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No activity recorded</p>
                  <p className="text-xs text-slate-400">Sync your repositories or LeetCode handle to stream live telemetry.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-3">
                  {activityList.map((act) => {
                    const IconComp = act.icon || Activity;
                    return (
                      <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3.5">
                        <div className={`p-2 rounded-xl bg-slate-100 dark:bg-white/5 ${act.color || 'text-amber-500'} shrink-0 mt-0.5`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {act.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {act.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {act.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* MODALS                                               */}
          {/* ==================================================== */}

          {/* Edit Profile Modal */}
          {isEditProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-lg bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Developer Profile</h3>
                  <button onClick={() => setIsEditProfileOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Username (Public URL slug)</label>
                      <input
                        type="text"
                        required
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500">Headline / Role</label>
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">College / Institution</label>
                      <input
                        type="text"
                        value={profileForm.college}
                        onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500">Bio</label>
                    <textarea
                      rows={2}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Social Profiles</label>
                    <input
                      type="url"
                      placeholder="GitHub URL (https://github.com/username)"
                      value={profileForm.githubUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                    <input
                      type="url"
                      placeholder="LeetCode URL (https://leetcode.com/u/username)"
                      value={profileForm.leetcodeUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, leetcodeUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL (https://linkedin.com/in/username)"
                      value={profileForm.linkedinUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Project Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-lg bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Featured Project</h3>
                  <button onClick={() => setIsAddModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Task Queue"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Explain the problem solved, architectural choices, and impact..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tech Stack Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Go, Docker, Redis, gRPC"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">Live Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://myproject.app"
                        value={projectForm.demoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                        className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/user/repo"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Project Modal */}
          {isEditProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-lg bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Project</h3>
                  <button onClick={() => setIsEditProjectModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <form onSubmit={handleUpdateProject} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Description</label>
                    <textarea
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tech Stack Tags</label>
                    <input
                      type="text"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">Live Demo URL</label>
                      <input
                        type="url"
                        value={projectForm.demoUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                        className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">GitHub URL</label>
                      <input
                        type="url"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditProjectModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl"
                    >
                      Update Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Import from GitHub Modal */}
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <GitHubIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Import from GitHub</h3>
                  </div>
                  <button onClick={() => setIsImportModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter your public GitHub username to automatically sync your public codebases, star ratings, and language telemetry to your portfolio.
                </p>

                <form onSubmit={handleQuickGitHubSync} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">GitHub Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. torvalds"
                      value={githubSyncHandle}
                      onChange={(e) => setGithubSyncHandle(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSyncingGH}
                      className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSyncingGH ? 'Syncing...' : 'Sync Repositories'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {isShareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-sm bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Public Profile Link Copied!</h3>
                <p className="text-xs text-slate-500">Share your live developer portfolio card with recruiters and peers.</p>
                <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 break-all select-all">
                  {publicProfileUrl}
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Open Public Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
