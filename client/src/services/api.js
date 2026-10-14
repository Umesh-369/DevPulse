import {
  initialUserData,
  initialProjectsData,
  leaderboardInitialData,
  aiCoachInitialData,
  languageDistributionData,
  problemSolvingTrendData,
  platformBarChartData,
  achievementsData,
  sampleProblemsData,
  sampleRepositoriesData,
  sampleGoalsData
} from './mockData';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Safe fetch wrapper with auth header and automatic fallback
async function fetchWithFallback(url, options = {}, fallbackData) {
  try {
    const token = localStorage.getItem('devpulse_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // If url starts with http/https, use as-is; otherwise prefix with API_BASE
    const baseUrl = (API_BASE || '').replace(/\/+$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    const apiPath = path.startsWith('/api') ? path : `/api${path}`;
    const fetchUrl = url.startsWith('http') ? url : `${baseUrl}${apiPath}`;

    const res = await fetch(fetchUrl, {
      ...options,
      headers,
      credentials: options.credentials || 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `HTTP error ${res.status}`);
      err.response = { data, status: res.status };
      throw err;
    }
    return data;
  } catch (err) {
    console.warn(`[DevPulse API] ${url}:`, err.message);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      return fetchWithFallback('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }, { success: true, user: initialUserData, token: 'devpulse_local_token' });
    },
    register: async (name, email, password) => {
      return fetchWithFallback('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }, { success: true, user: { ...initialUserData, name, email }, token: 'devpulse_local_token' });
    },
    getMe: async (token) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return fetchWithFallback('/auth/me', { headers }, { success: true, user: initialUserData });
    },
    getStatus: async () => {
      return fetchWithFallback('/auth/status', {}, {
        success: true,
        google: { configured: true },
        github: { configured: true }
      });
    }
  },
  platforms: {
    connectLeetCode: async (username) => {
      return fetchWithFallback('/platforms/connect/leetcode', {
        method: 'POST',
        body: JSON.stringify({ username })
      });
    },
    connectGitHub: async (username) => {
      return fetchWithFallback('/platforms/connect/github', {
        method: 'POST',
        body: JSON.stringify({ username })
      });
    },
    connectGeneric: async (platform, handle) => {
      return fetchWithFallback(`/platforms/connect/${platform.toLowerCase()}`, {
        method: 'POST',
        body: JSON.stringify({ handle })
      });
    },
    getStats: async () => {
      return fetchWithFallback('/platforms/stats', {}, { success: true, stats: [] });
    }
  },
  user: {
    getProfile: async () => {
      return fetchWithFallback('/user/profile', {}, { success: true, user: initialUserData });
    },
    updateProfile: async (data) => {
      return fetchWithFallback('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }, { success: true, message: 'Profile updated', user: { ...initialUserData, ...data } });
    },
    connectPlatform: async (platform, handle) => {
      const pKey = platform.toLowerCase();
      if (pKey === 'leetcode') {
        return api.platforms.connectLeetCode(handle);
      }
      if (pKey === 'github') {
        return api.platforms.connectGitHub(handle);
      }
      return api.platforms.connectGeneric(pKey, handle);
    }
  },
  projects: {
    getAll: async () => {
      return fetchWithFallback('/projects', {}, { success: true, projects: [] });
    },
    create: async (data) => {
      return fetchWithFallback('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id, data) => {
      return fetchWithFallback(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id) => {
      return fetchWithFallback(`/projects/${id}`, {
        method: 'DELETE'
      });
    }
  },
  analytics: {
    get: async (timeframe = '6m') => {
      return fetchWithFallback(`/analytics?timeframe=${timeframe}`, {}, {
        success: true,
        timeframe,
        stats: initialUserData.stats,
        languageDistribution: languageDistributionData,
        problemSolvingTrend: problemSolvingTrendData,
        platformBarChart: platformBarChartData,
        achievements: achievementsData
      });
    }
  },
  leaderboard: {
    get: async (scope = 'global', timeframe = 'month') => {
      return fetchWithFallback(`/leaderboard?scope=${scope}&timeframe=${timeframe}`, {}, {
        success: true,
        scope,
        timeframe,
        leaderboard: []
      });
    }
  },
  portfolio: {
    getMe: async () => {
      return fetchWithFallback('/portfolio/me', {}, { success: true, profile: {}, stats: {}, customProjects: [], featuredRepos: [] });
    },
    updateProfile: async (data) => {
      return fetchWithFallback('/portfolio/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    createProject: async (data) => {
      return fetchWithFallback('/portfolio/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    updateProject: async (id, data) => {
      return fetchWithFallback(`/portfolio/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    deleteProject: async (id) => {
      return fetchWithFallback(`/portfolio/projects/${id}`, {
        method: 'DELETE'
      });
    },
    getPublic: async (username) => {
      return fetchWithFallback(`/portfolio/u/${encodeURIComponent(username)}`, {}, { success: false, message: 'User not found' });
    }
  },
  ai: {
    getInsights: async () => {
      return fetchWithFallback('/ai-insights', {}, { success: true, report: aiCoachInitialData, apiKeyConfigured: true });
    },
    generate: async (apiKey) => {
      return fetchWithFallback('/ai-insights/generate', {
        method: 'POST',
        body: JSON.stringify({ apiKey })
      });
    },
    toggleTask: async (roadId, taskId) => {
      return fetchWithFallback('/ai-insights/toggle-task', {
        method: 'POST',
        body: JSON.stringify({ roadId, taskId })
      }, { success: true });
    },
    saveApiKey: async (apiKey) => {
      return fetchWithFallback('/ai-insights/api-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey })
      });
    },
    getCoach: async () => {
      return fetchWithFallback('/ai-insights', {}, { success: true, report: aiCoachInitialData, coach: aiCoachInitialData });
    },
    regenerate: async () => {
      return fetchWithFallback('/ai-insights/generate', { method: 'POST' });
    }
  },
  problems: {
    get: async (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return fetchWithFallback(`/problems?${q}`, {}, { success: true, problems: [], stats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 } });
    },
    sync: async (username) => {
      return fetchWithFallback('/problems/sync', {
        method: 'POST',
        body: JSON.stringify(username ? { username } : {})
      });
    },
    log: async (problemData) => {
      return fetchWithFallback('/problems', {
        method: 'POST',
        body: JSON.stringify(problemData)
      });
    }
  },
  repositories: {
    get: async () => {
      return fetchWithFallback('/repositories', {}, { success: true, repositories: [] });
    },
    sync: async (username) => {
      return fetchWithFallback('/repositories/sync', {
        method: 'POST',
        body: JSON.stringify(username ? { username } : {})
      });
    },
    toggleFeature: async (id) => {
      return fetchWithFallback(`/repositories/${id}/toggle-feature`, {
        method: 'POST'
      });
    }
  },
  goals: {
    get: async () => {
      return fetchWithFallback('/goals', {}, { success: true, goals: sampleGoalsData });
    },
    create: async (data) => {
      return fetchWithFallback('/goals', {
        method: 'POST',
        body: JSON.stringify(data)
      }, {
        success: true,
        goal: { id: `g_${Date.now()}`, ...data, current: 0, progress: 0 }
      });
    }
  }
};
