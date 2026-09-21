'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '../_components/AdminSidebar';
import {
  FileCode2,
  ExternalLink,
  Shield,
  Copy,
  Check,
  Menu,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';

interface ApiEndpointDef {
  id: string;
  tag: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  defaultParams?: Record<string, string>;
  defaultBody?: string;
  queryParams?: { name: string; placeholder: string; required?: boolean; defaultValue?: string }[];
}

const API_ENDPOINTS: ApiEndpointDef[] = [
  // System & Health
  {
    id: 'health-public',
    tag: 'System & Health',
    method: 'GET',
    path: '/health',
    summary: 'Public System Health Ping',
    description: 'Returns operational status and uptime check of newsfree365-api service.',
    requiresAuth: false,
  },
  {
    id: 'health-admin',
    tag: 'System & Health',
    method: 'GET',
    path: '/api/admin/health',
    summary: 'Protected Diagnostic Health & Storage Monitor',
    description: 'Detailed diagnostic health report: MySQL ping latency, table storage in MB, memory RSS/heap, and subscriber counts.',
    requiresAuth: true,
  },
  {
    id: 'admin-stats',
    tag: 'System & Health',
    method: 'GET',
    path: '/api/admin/stats',
    summary: 'Admin Dashboard Metric Summary',
    description: 'Returns total article counts, published counts, pending queue size, and active RSS source totals.',
    requiresAuth: true,
  },

  // News Discovery
  {
    id: 'news-latest',
    tag: 'News Discovery',
    method: 'GET',
    path: '/api/news/latest',
    summary: 'Fetch Latest Published Articles',
    description: 'Retrieves latest articles with pagination and optional category filter.',
    requiresAuth: false,
    queryParams: [
      { name: 'category', placeholder: 'e.g. Markets, Technology, Politics', defaultValue: '' },
      { name: 'page', placeholder: '1', defaultValue: '1' },
      { name: 'limit', placeholder: '10', defaultValue: '10' },
    ],
  },
  {
    id: 'news-trending',
    tag: 'News Discovery',
    method: 'GET',
    path: '/api/news/trending',
    summary: 'Fetch Algorithmic Trending Articles',
    description: 'Returns top trending stories scored by freshness decay and velocity engagement.',
    requiresAuth: false,
    queryParams: [{ name: 'limit', placeholder: '5', defaultValue: '5' }],
  },
  {
    id: 'news-categories',
    tag: 'News Discovery',
    method: 'GET',
    path: '/api/posts/categories',
    summary: 'List Available News Categories',
    description: 'Returns list of unique news categories with active story counts.',
    requiresAuth: false,
  },
  {
    id: 'market-quotes',
    tag: 'Financial Markets',
    method: 'GET',
    path: '/api/market-quotes',
    summary: 'Real-Time Global Market Quotes',
    description: 'Returns live global indices (Nifty, Sensex, Dow, S&P 500), commodities (Gold, Crude Oil), and Forex rates.',
    requiresAuth: false,
  },

  // Live Sports Hubs
  {
    id: 'cricket-matches',
    tag: 'Live Sports',
    method: 'GET',
    path: '/api/cricket/matches',
    summary: 'Live & Upcoming Cricket Match Feeds',
    description: 'Returns real-time Cricbuzz match feed with team details, scores, and status.',
    requiresAuth: false,
  },
  {
    id: 'football-matches',
    tag: 'Live Sports',
    method: 'GET',
    path: '/api/football/matches',
    summary: 'Live Football Fixtures & Scores',
    description: 'Returns real-time football scores across Premier League, La Liga, Champions League, etc.',
    requiresAuth: false,
  },

  // Interactive Reader Tools
  {
    id: 'quiz-today',
    tag: 'Interactive Tools',
    method: 'GET',
    path: '/api/quiz/today',
    summary: 'Fetch Daily News Intelligence Quiz',
    description: 'Returns today\'s 5 curated news intelligence quiz questions with options and explanation.',
    requiresAuth: false,
  },
  {
    id: 'polls-active',
    tag: 'Interactive Tools',
    method: 'GET',
    path: '/api/polls/active',
    summary: 'Fetch Active Community Opinion Poll',
    description: 'Returns active opinion poll question, options, and live total vote counts.',
    requiresAuth: false,
  },
  {
    id: 'calendar-events',
    tag: 'Interactive Tools',
    method: 'GET',
    path: '/api/calendar/events',
    summary: 'List Macroeconomic Calendar Events',
    description: 'Retrieves macroeconomic indicators, market holidays, IPOs, and corporate earnings triggers.',
    requiresAuth: false,
    queryParams: [
      { name: 'type', placeholder: 'all, economy, holiday, result, ipo', defaultValue: 'all' },
      { name: 'country', placeholder: 'IN, US, GLOBAL, all', defaultValue: 'all' },
      { name: 'limit', placeholder: '10', defaultValue: '10' },
    ],
  },

  // Admin Operations
  {
    id: 'admin-articles',
    tag: 'Admin Operations',
    method: 'GET',
    path: '/api/admin/articles',
    summary: 'List Articles for Editorial Desk',
    description: 'Fetches paginated articles with optional status filter (published, pending, draft).',
    requiresAuth: true,
    queryParams: [
      { name: 'status', placeholder: 'pending, published, all', defaultValue: 'pending' },
      { name: 'limit', placeholder: '10', defaultValue: '10' },
    ],
  },
  {
    id: 'admin-ranking',
    tag: 'Admin Operations',
    method: 'POST',
    path: '/api/admin/ranking',
    summary: 'Trigger Algorithmic Ranking Pass',
    description: 'Recalculates velocity metrics, freshness decay, and trending scores for all published stories.',
    requiresAuth: true,
  },
  {
    id: 'admin-ingest',
    tag: 'Admin Operations',
    method: 'POST',
    path: '/api/admin/ingest',
    summary: 'Trigger On-Demand RSS Feeds Ingest',
    description: 'Runs immediate crawl across all 40+ configured RSS sources.',
    requiresAuth: true,
  },
  {
    id: 'admin-sources',
    tag: 'Admin Operations',
    method: 'GET',
    path: '/api/admin/sources',
    summary: 'List Managed Feed Sources',
    description: 'Returns list of active and inactive RSS news sources.',
    requiresAuth: true,
  },
];

export default function AdminApiDocsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSecret, setAdminSecret] = useState('Raunak@123');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string>('health-admin');

  // Interactive Test State per endpoint
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});
  const [testBodies, setTestBodies] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<
    Record<
      string,
      {
        loading: boolean;
        status?: number;
        statusText?: string;
        timeMs?: number;
        data?: any;
        error?: string;
      }
    >
  >({});

  const swaggerUrl = 'http://localhost:4050/api/docs';
  const openApiJsonUrl = 'http://localhost:4050/api/docs/openapi.json';

  const tags = ['All', ...Array.from(new Set(API_ENDPOINTS.map((e) => e.tag)))];

  const filteredEndpoints = API_ENDPOINTS.filter((ep) => {
    const matchesTag = selectedTag === 'All' || ep.tag === selectedTag;
    const matchesSearch =
      ep.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleParamChange = (endpointId: string, paramName: string, value: string) => {
    setTestParams((prev) => ({
      ...prev,
      [endpointId]: {
        ...(prev[endpointId] || {}),
        [paramName]: value,
      },
    }));
  };

  const executeApiTest = async (endpoint: ApiEndpointDef) => {
    const endpointId = endpoint.id;
    setTestResults((prev) => ({
      ...prev,
      [endpointId]: { loading: true },
    }));

    const startTime = performance.now();

    try {
      // Build Query String
      const params = testParams[endpointId] || {};
      const urlParams = new URLSearchParams();

      endpoint.queryParams?.forEach((qp) => {
        const val = params[qp.name] !== undefined ? params[qp.name] : qp.defaultValue;
        if (val) urlParams.append(qp.name, val);
      });

      const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';
      const fullUrl = `http://localhost:4050${endpoint.path}${queryString}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (endpoint.requiresAuth && adminSecret) {
        headers['x-admin-secret'] = adminSecret.trim();
        headers['Authorization'] = `Bearer ${adminSecret.trim()}`;
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.method !== 'GET' && testBodies[endpointId]) {
        options.body = testBodies[endpointId];
      }

      const res = await fetch(fullUrl, options);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          loading: false,
          status: res.status,
          statusText: res.statusText,
          timeMs,
          data,
        },
      }));
    } catch (err: any) {
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          loading: false,
          error: err.message || 'Network request failed',
          timeMs: Math.round(endTime - startTime),
        },
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-[#090d16]/90 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <BrandMark sizeClass="h-6 w-6" />
              <span className="text-sm font-bold text-white">NewsFree365</span>
              <span className="text-slate-600">/</span>
              <span className="text-sm font-semibold text-slate-300">API Documentation & Test Suite</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              <FileCode2 size={12} />
              OpenAPI 3.0 Live
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 p-6 rounded-2xl border border-slate-800/80 shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <FileCode2 size={24} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  API Documentation & Real-Time Test Suite
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Interactive Runner
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">
                Comprehensive documentation for every core API endpoint with live in-browser testing, real response payloads, and latency timing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => copyToClipboard(openApiJsonUrl)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>Copy OpenAPI JSON</span>
              </button>

              <a
                href={swaggerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-900/30 transition active:scale-95"
              >
                <span>Open Standalone Swagger</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Admin Secret Configuration Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Admin Key</h3>
                <p className="text-[11px] text-slate-400">Automatically attached to protected endpoints when running tests.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter ADMIN_SECRET"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500 w-full sm:w-64"
              />
              <span className="text-[11px] px-2 py-1 rounded bg-teal-500/20 text-teal-300 font-bold shrink-0">
                Authorized
              </span>
            </div>
          </div>

          {/* Category Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Endpoints Interactive List */}
          <div className="space-y-3">
            {filteredEndpoints.map((ep) => {
              const isExpanded = expandedEndpoint === ep.id;
              const result = testResults[ep.id];
              const methodColor =
                ep.method === 'GET'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : ep.method === 'POST'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : ep.method === 'PUT'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={ep.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-sm transition hover:border-slate-700/80"
                >
                  {/* Endpoint Header Bar */}
                  <div
                    onClick={() => setExpandedEndpoint(isExpanded ? '' : ep.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${methodColor}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-200 truncate">{ep.path}</span>
                      <span className="text-xs text-slate-400 hidden md:inline truncate">— {ep.summary}</span>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      {ep.requiresAuth && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Shield size={10} /> Auth Required
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">{ep.tag}</span>
                      {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Sandbox Runner */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed">{ep.description}</p>

                      {/* Query Parameters Section */}
                      {ep.queryParams && ep.queryParams.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Query Parameters</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {ep.queryParams.map((qp) => (
                              <div key={qp.name} className="flex flex-col gap-1">
                                <label className="text-[11px] font-mono text-slate-400">{qp.name}:</label>
                                <input
                                  type="text"
                                  placeholder={qp.placeholder}
                                  value={
                                    testParams[ep.id]?.[qp.name] !== undefined
                                      ? testParams[ep.id][qp.name]
                                      : qp.defaultValue || ''
                                  }
                                  onChange={(e) => handleParamChange(ep.id, qp.name, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Execution Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => executeApiTest(ep)}
                          disabled={result?.loading}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
                        >
                          <Play size={14} className={result?.loading ? 'animate-spin' : ''} />
                          <span>{result?.loading ? 'Executing Request...' : 'Send Test Request'}</span>
                        </button>

                        {result && result.timeMs !== undefined && (
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={12} /> {result.timeMs}ms
                            </span>
                            {result.status ? (
                              <span
                                className={`px-2 py-0.5 rounded font-bold font-mono ${
                                  result.status >= 200 && result.status < 300
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {result.status} {result.statusText}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Execution Response Viewer */}
                      {result && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between pb-1.5 text-[11px] text-slate-400">
                            <span className="font-semibold uppercase tracking-wider">Live Response Payload</span>
                            {result.data && (
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Copy size={11} /> Copy JSON
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto rounded-xl bg-[#090d16] p-4 border border-slate-800/80 font-mono text-xs text-slate-300">
                            {result.error ? (
                              <span className="text-rose-400">{result.error}</span>
                            ) : (
                              <pre className="whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
