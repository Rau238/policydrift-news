'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Save,
  Send,
  Eye,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Flame,
  Star,
  Tag,
  User,
  Layers,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  SplitSquareVertical,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Calendar,
  Share2,
  Bookmark,
  Heart,
  Globe,
  FileText,
  Sliders,
  Check,
  Hash,
  UploadCloud,
  Copy,
  FilePlus,
  Maximize2,
  Minimize2,
  Code,
  Link2,
  Table,
  Minus,
  Strikethrough,
  ListOrdered,
  CheckSquare,
  Type,
  Info,
  Eraser,
  Columns,
  PanelRightClose,
  PanelRightOpen,
  EyeOff,
  ChevronLeft,
  BookOpen,
  PenTool,
  Loader2,
  RotateCcw,
  X,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { CATEGORY_ORDER, categoryLabel, categoryChipClass, CategoryGlyph } from '@/lib/categories';
import { AdminSidebar } from '../_components/AdminSidebar';
import { StoryTimeline, type TimelineItem, extractTimelineFromContent } from '@/components/StoryTimeline';
import { ParticleStoryImageStack } from '@/components/ParticleStoryImageStack';
import { RichStoryBody } from '@/components/RichStoryBody';

// ── Curated High-Quality Local Category Curated Editorial Presets ─────────────
const IMAGE_PRESETS = [
  {
    name: 'Stock Market & Economy',
    category: 'business',
    url: '/images/category-curated/stock-market.webp',
    description: 'Trading charts, financial screens, and market analytics',
  },
  {
    name: 'Artificial Intelligence & Tech',
    category: 'technology',
    url: '/images/category-curated/ai.jfif',
    description: 'Neural networks, quantum computing, and code infrastructure',
  },
  {
    name: 'Parliament & Governance',
    category: 'politics',
    url: '/images/category-curated/parliment%26governace.jpg',
    description: 'Legislative halls, official press conferences, and policy summits',
  },
  {
    name: 'Global Diplomacy & World',
    category: 'world',
    url: '/images/category-curated/Global%20Diplomacy%20%26%20World.jfif',
    description: 'International summits, treaties, and geopolitical alliances',
  },
  {
    name: 'Breaking News Desk',
    category: 'india',
    url: '/images/category-curated/Breaking%20News%20Desk.avif',
    description: 'Live broadcast rooms, flash alerts, and developing national stories',
  },
  {
    name: 'Stadium & Sports Arena',
    category: 'sports',
    url: '/images/category-curated/Stadium%20%26%20Sports%20Arena.webp',
    description: 'Floodlit stadiums, cricket pitches, and championship tournaments',
  },
  {
    name: 'Science & Deep Space',
    category: 'science',
    url: '/images/category-curated/Science%20%26%20Deep%20Space.jpeg',
    description: 'Space telescopes, observatories, and scientific discoveries',
  },
  {
    name: 'Medical & Healthcare',
    category: 'health',
    url: '/images/category-curated/Medical%20%26%20Healthcare.jpg',
    description: 'Hospitals, clinical research laboratories, and health policy',
  },
];

type UploadedImageItem = {
  url: string;
  name?: string;
  size?: number;
  type?: string;
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AdminCreateArticleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [category, setCategory] = useState<string>('politics');
  const [author, setAuthor] = useState('PolicyDrift Editorial Desk');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'published' | 'pending' | 'draft'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [breakingHours, setBreakingHours] = useState(4);
  const [editorialPriority, setEditorialPriority] = useState<'normal' | 'high' | 'pinned'>('normal');
  const [tagsInput, setTagsInput] = useState('Policy, Analysis, Verified');

  // Multi-Image Gallery State
  const [galleryImages, setGalleryImages] = useState<UploadedImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Key Takeaways Builder
  const [takeaways, setTakeaways] = useState<string[]>([
    'Official regulatory circular ratified with immediate sector compliance effect.',
    'Broad economic and institutional alignment projected across domestic markets.',
  ]);

  // Chronological Timeline Builder
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      id: 1,
      time: '09:30 AM IST',
      title: 'Official notification gazetted',
      description: 'Department spokesperson releases statutory regulatory framework in New Delhi.',
      isKeyMilestone: true,
    },
    {
      id: 2,
      time: '11:45 AM IST',
      title: 'Industry stakeholders convene briefing',
      description: 'Key market participants review capital adequacy and compliance timelines.',
      isKeyMilestone: false,
    },
    {
      id: 3,
      time: '02:15 PM IST',
      title: 'Markets react with positive liquidity surge',
      description: 'Benchmark indices gain over 1.8% following policy clarity.',
      isKeyMilestone: true,
    },
  ]);

  // UI state (Preview closed by default for full-width editor)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; publishedSlug?: string } | null>(null);

  // Load article for editing if editId is provided
  useEffect(() => {
    if (!editId) return;
    let isMounted = true;
    async function loadArticle() {
      setLoadingEdit(true);
      try {
        const res = await fetch(`/api/admin/articles/${editId}`);
        if (!res.ok) throw new Error('Article not found');
        const post = await res.json();
        if (!isMounted) return;

        setTitle(post.title || '');
        setSlug(post.slug || '');
        setAutoSlug(false);
        setCategory(post.category || 'politics');
        setAuthor(post.author || 'PolicyDrift Editorial Desk');
        setExcerpt(post.excerpt || '');
        setImageUrl(post.image_url || '');
        setStatus(post.status === 'published' ? 'published' : post.status === 'pending' ? 'pending' : 'draft');
        setIsFeatured(Boolean(post.is_featured));
        setIsBreaking(Boolean(post.is_breaking));
        setEditorialPriority(post.editorial_priority || 'normal');

        // Extract timeline if present in body or structured post
        if (post.body) {
          const parsedTimeline = extractTimelineFromContent(post.body);
          if (parsedTimeline && parsedTimeline.length > 0) {
            setTimeline(parsedTimeline);
          }
          const cleanBody = post.body.replace(/<!--\s*STORY_TIMELINE:[\s\S]*?-->/g, '').trim();
          setBody(cleanBody);
        } else {
          setBody('');
        }

        // Parse key takeaways
        if (post.key_takeaways) {
          const lines = post.key_takeaways.split(/\n+/).map((l: string) => l.trim()).filter(Boolean);
          if (lines.length > 0) setTakeaways(lines);
        }

        // Parse tags
        if (post.tags) {
          try {
            const parsed = typeof post.tags === 'string' && post.tags.startsWith('[') ? JSON.parse(post.tags) : post.tags;
            if (Array.isArray(parsed)) {
              setTagsInput(parsed.join(', '));
            } else if (typeof post.tags === 'string') {
              setTagsInput(post.tags);
            }
          } catch {
            setTagsInput(String(post.tags));
          }
        }

        if (post.image_url) {
          setGalleryImages([{ url: post.image_url, name: 'Hero Cover Image' }]);
        }

        setFeedback({
          type: 'success',
          message: `Loaded "${post.title.slice(0, 50)}..." for editing`,
          publishedSlug: post.slug,
        });
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to load article for editing' });
      } finally {
        if (isMounted) setLoadingEdit(false);
      }
    }
    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [editId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const wordCount = useMemo(() => {
    const text = `${title} ${excerpt} ${body}`.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [title, excerpt, body]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Handle Multi-file Upload
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(`Uploading ${files.length} image(s)...`);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      if (data.files && data.files.length > 0) {
        const newItems: UploadedImageItem[] = data.files.map((f: any) => ({
          url: f.url,
          name: f.name || f.filename,
          size: f.size,
          type: f.type,
        }));

        // Set the first uploaded as hero cover if none selected yet
        if (!imageUrl && newItems.length > 0) {
          setImageUrl(newItems[0].url);
        }

        setGalleryImages((prev) => {
          // Avoid duplicate URLs
          const existingUrls = new Set(prev.map((img) => img.url));
          const uniqueNew = newItems.filter((img) => !existingUrls.has(img.url));
          return [...prev, ...uniqueNew];
        });

        setFeedback({
          type: 'success',
          message: `Successfully uploaded ${newItems.length} image(s)!`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error during image upload' });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleInsertImageToBody = (imgUrl: string, caption?: string) => {
    const markdownImg = `\n\n![${caption || 'Article illustration'}](${imgUrl})\n`;
    setBody((prev) => `${prev}${markdownImg}`);
    setFeedback({ type: 'success', message: 'Inserted image into story narrative body!' });
  };

  const handleAddPresetToGallery = (preset: (typeof IMAGE_PRESETS)[0]) => {
    setImageUrl(preset.url);
    setCategory(preset.category);
    setGalleryImages((prev) => {
      if (prev.some((img) => img.url === preset.url)) return prev;
      return [...prev, { url: preset.url, name: preset.name }];
    });
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.url !== urlToRemove));
    if (imageUrl === urlToRemove) {
      const remaining = galleryImages.filter((img) => img.url !== urlToRemove);
      setImageUrl(remaining.length > 0 ? remaining[0].url : '');
    }
  };

  const handleAddTakeaway = () => {
    setTakeaways([...takeaways, '']);
  };

  const handleUpdateTakeaway = (index: number, value: string) => {
    const updated = [...takeaways];
    updated[index] = value;
    setTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const handleAddTimelineItem = () => {
    const nextId = timeline.length > 0 ? Math.max(...timeline.map((t) => Number(t.id) || 0)) + 1 : 1;
    setTimeline([
      ...timeline,
      {
        id: nextId,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        title: '',
        description: '',
        isKeyMilestone: false,
      },
    ]);
  };

  const handleUpdateTimelineItem = (index: number, field: keyof TimelineItem, value: any) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };

  const handleRemoveTimelineItem = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [narrativeTab, setNarrativeTab] = useState<'write' | 'preview' | 'split'>('write');
  const [isNarrativeFullscreen, setIsNarrativeFullscreen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [showCuratedPicker, setShowCuratedPicker] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);

  // Selection-aware Markdown / HTML Formatter
  const insertFormat = (prefix: string, suffix: string = '', defaultText: string = 'text') => {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => `${prev}\n\n${prefix}${defaultText}${suffix}\n`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;

    const before = el.value.substring(0, start);
    const after = el.value.substring(end);
    setBody(`${before}${replacement}${after}`);

    setTimeout(() => {
      el.focus();
      const newCursor = start + prefix.length + (selected ? selected.length : defaultText.length);
      el.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  // Keyboard Shortcuts for Pro Speed
  const handleNarrativeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertFormat('**', '**', 'bold text');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertFormat('*', '*', 'italic text');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const url = prompt('Enter link URL:', 'https://');
        if (url) {
          insertFormat('[', `](${url})`, 'link text');
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        insertFormat('`', '`', 'code snippet');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertFormat('  ', '', '');
    }
  };

  // Pre-configured Journalistic Editorial Story Templates
  const insertStoryTemplate = (type: 'standard' | 'breaking' | 'interview' | 'deepdive') => {
    let template = '';
    if (type === 'standard') {
      template = `## Executive Summary & Context\nAuthoritative opening overview detailing the core regulatory action, primary entity involved, and its immediate significance.\n\n## Key Strategic Developments\nDetailed analytical breakdown of statutory notifications, legal framework provisions, or institutional decisions.\n\n> [!NOTE]\n> Regulatory takeaway: Industry participants must enact compliance alignment protocols within statutory deadlines.\n\n## Official Commentary & Statements\n> "This gazetted framework represents an important modernization milestone for transparent market operations."\n> - *Official Spokesperson, National Regulatory Authority*\n\n## Market & Industry Forward Outlook\nSummary of upcoming hearings, implementation phases, or sector ripple effects for reader reference.`;
    } else if (type === 'breaking') {
      template = `## Developing Alert: Immediate Overview\n**NEW DELHI** - Rapidly unfolding developments as statutory authorities confirm initial operational briefing.\n\n## What Is Known Right Now\n- Primary incident verified on site with relevant agency teams deployed\n- Official precautionary advisory in effect for regional stakeholders\n- High-level briefing scheduled for release shortly\n\n> "Response teams have secured operational protocols and ongoing assessments continue."\n> - *Department Briefing Desk*\n\n## Continuing Coverage\nPolicyDrift newsroom is actively tracking corroborated updates. Real-time details will follow as verified.`;
    } else if (type === 'deepdive') {
      template = `## Macroeconomic Context & Structural Analysis\nAn investigative analysis examining foundational macroeconomic drivers, fiscal policy shifts, and systemic realignments across the sector.\n\n| Indicator | Baseline Period | Revised Projection | Variance |\n|---|---|---|---|\n| Core Output | +3.2% | +4.8% | +1.6% |\n| Liquidity Ratio | 84.1% | 89.5% | +5.4% |\n| Sector CapEx | $14.2B | $18.6B | +31.0% |\n\n## Long-Term Market Implications\nDeep evaluation of capital allocation patterns, institutional responses, and sovereign policy levers.\n\n### Stakeholder Assessment\n- **Institutional Investors:** Accelerated allocation to compliant assets\n- **Domestic Enterprises:** Upgraded transparency and disclosure standards`;
    } else if (type === 'interview') {
      template = `## Exclusive Q&A with Industry Leadership\nPolicyDrift spoke with key decision-makers regarding newly announced statutory reforms and subsequent economic realignment.\n\n### Q: What prompted the immediate timing of this regulatory revision?\n> **Leadership Response:** "Over the past three quarters, cross-border capital velocity required a modernized supervisory mechanism that safeguards retail participants without curtailing innovation."\n\n### Q: How will implementation be phased across regional desks?\n> **Leadership Response:** "We have structured a 90-day transitional window followed by structured institutional audits."\n\n## Key Strategic Insights\nSummary of primary takeaways from the briefing and operational milestones ahead.`;
    }

    if (body.trim()) {
      if (confirm('Append this journalistic template to your existing narrative? Click OK to append.')) {
        setBody((prev) => `${prev}\n\n${template}`);
      }
    } else {
      setBody(template);
    }
    setShowTemplatesMenu(false);
  };

  const copyAsHtml = () => {
    let html = body
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n\n/gim, '</p><p>');
    html = `<p>${html}</p>`;
    navigator.clipboard.writeText(html);
    setCopiedNotification('HTML copied to clipboard!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const copyAsMarkdown = () => {
    navigator.clipboard.writeText(body);
    setCopiedNotification('Markdown source copied!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Narrative Statistics
  const narrativeWords = useMemo(() => {
    const text = body.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [body]);

  const narrativeChars = useMemo(() => body.length, [body]);
  const narrativeParagraphs = useMemo(() => {
    return body.trim() ? body.split(/\n\s*\n/).filter(Boolean).length : 0;
  }, [body]);
  const narrativeReadingTime = useMemo(() => {
    return Math.max(1, Math.ceil(narrativeWords / 200));
  }, [narrativeWords]);

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setAutoSlug(true);
    setExcerpt('');
    setBody('');
    setImageUrl('');
    setCategory('politics');
    setAuthor('PolicyDrift Editorial Desk');
    setStatus('published');
    setIsFeatured(false);
    setIsBreaking(false);
    setBreakingHours(4);
    setEditorialPriority('normal');
    setTagsInput('Policy, Analysis, Verified');
    setGalleryImages([]);
    setTakeaways([
      'Official regulatory circular ratified with immediate sector compliance effect.',
      'Broad economic and institutional alignment projected across domestic markets.',
    ]);
    setTimeline([
      {
        time: '09:00 IST',
        title: 'Initial Gazette Notification Released',
        description: 'Statutory authority uploaded circular provisions to the public portal.',
      },
      {
        time: '11:30 IST',
        title: 'Inter-Agency Consultation Concluded',
        description: 'Technical working group aligned on standard operating rules.',
      },
    ]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('policydrift_story_draft_v1');
      } catch {}
    }
  };

  const handleSubmit = async (submitStatus?: 'published' | 'pending' | 'draft') => {
    const targetStatus = submitStatus || status;
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Article headline is required.' });
      return;
    }
    if (!body.trim() && !excerpt.trim()) {
      setFeedback({ type: 'error', message: 'Article must have either an excerpt summary or story narrative body.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const validTakeaways = takeaways.filter((t) => t.trim().length > 0);
      const validTimeline = timeline.filter((t) => t.title.trim().length > 0 || t.time.trim().length > 0);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        category,
        author: author.trim() || 'PolicyDrift Editorial Desk',
        excerpt: excerpt.trim() || title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || null,
        status: targetStatus,
        is_featured: isFeatured,
        featured_hours: 24,
        is_breaking: isBreaking,
        breaking_hours: isBreaking ? breakingHours : 0,
        editorial_priority: editorialPriority,
        tags: parsedTags,
        takeaways: validTakeaways,
        timeline: validTimeline,
      };

      const endpoint = editId ? `/api/admin/articles/${editId}` : '/api/admin/articles';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Failed to save article (${res.status})`);
      }

      const finalSlug = data.article?.slug || slug || slugify(title);

      setFeedback({
        type: 'success',
        message: editId
          ? 'Article updated successfully! Redirecting...'
          : targetStatus === 'published'
          ? 'Article published successfully! Redirecting to Authored Stories...'
          : targetStatus === 'draft'
          ? 'Article saved to drafts! Redirecting to Drafts...'
          : 'Article saved to review queue! Redirecting...',
        publishedSlug: finalSlug,
      });

      // Clear all fields
      resetForm();

      // Route to relevant page in admin dashboard
      setTimeout(() => {
        if (targetStatus === 'published') {
          router.push('/admin/dashboard?status=authored');
        } else if (targetStatus === 'draft') {
          router.push('/admin/dashboard?status=draft');
        } else if (targetStatus === 'pending') {
          router.push('/admin/dashboard?status=pending');
        } else {
          router.push('/admin/dashboard');
        }
      }, 900);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error occurred while saving article.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTags = useMemo(() => {
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsInput]);

  // Gallery list for preview 3D stack
  const secondaryPreviewImages = useMemo(() => {
    return galleryImages
      .filter((img) => img.url !== imageUrl)
      .map((img) => ({
        src: img.url,
        alt: img.name || 'Story media image',
        title: img.name || 'Story media image',
      }));
  }, [galleryImages, imageUrl]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070b14] text-slate-100 font-sans antialiased">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Studio Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0c1220]/95 px-4 sm:px-6 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 transition hover:border-slate-700 hover:text-white shrink-0"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {editId ? `Edit Story #${editId}` : 'Article Editorial Studio'}
                </h1>
                {editId ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                    <PenTool size={11} />
                    Edit Mode
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/20">
                    <Sparkles size={11} />
                    Media & Timeline Suite
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {wordCount} words · {readingTime} min read
                </span>
                {slug && (
                  <Link
                    href={`/news/${slug}`}
                    target="_blank"
                    className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition underline underline-offset-2"
                  >
                    <span>View live page</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>
              <p className="hidden md:block text-xs text-slate-400 truncate">
                {editId
                  ? 'Update story headlines, markdown narrative, key highlights, timelines, and editorial metadata.'
                  : 'Author stories with multi-image upload, interactive timelines, takeaways, and editorial controls.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dedicated Open/Close Live Preview Button */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editor' ? 'split' : 'editor')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition border shadow-xs active:scale-95 ${
                activeTab === 'editor'
                  ? 'border-teal-500/50 bg-teal-950/60 text-teal-300 hover:bg-teal-900/70 hover:border-teal-400'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600'
              }`}
              title={activeTab === 'editor' ? 'Open Live Reader Preview Pane' : 'Close Preview & Expand Editor Full Width'}
            >
              {activeTab === 'editor' ? (
                <>
                  <PanelRightOpen size={15} className="text-teal-400" />
                  <span>Open Live Preview</span>
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                </>
              ) : (
                <>
                  <PanelRightClose size={15} className="text-slate-400" />
                  <span>Close Preview (Full Width)</span>
                </>
              )}
            </button>

            {/* Split / Preview Toggle */}
            <div className="hidden md:flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === 'editor' ? 'bg-teal-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Width Editor (Preview Closed)"
              >
                <FileText size={13} />
                <span>Full Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === 'split' ? 'bg-teal-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split View (Editor + Live Preview 50/50)"
              >
                <SplitSquareVertical size={13} />
                <span>Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === 'preview' ? 'bg-teal-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Reader Preview Only"
              >
                <Eye size={13} />
                <span>Reader View</span>
              </button>
            </div>

            {/* Clear Fields / New Story */}
            <button
              type="button"
              onClick={() => {
                if (title.trim() || body.trim()) {
                  if (confirm('Are you sure you want to clear all fields and start a fresh story?')) {
                    resetForm();
                    if (editId) {
                      router.push('/admin/create');
                    }
                  }
                } else {
                  resetForm();
                }
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              title="Clear all fields to write a new story"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>

            {/* Save Draft */}
            <button
              type="button"
              disabled={submitting || loadingEdit}
              onClick={() => handleSubmit('draft')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-50"
            >
              <Save size={13} />
              <span>{editId ? 'Save as Draft' : 'Save Draft'}</span>
            </button>

            {/* Main Publish / Update Button */}
            <button
              type="button"
              disabled={submitting || loadingEdit}
              onClick={() => handleSubmit('published')}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/25 transition hover:bg-teal-400 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : editId ? (
                <Save size={14} />
              ) : (
                <Send size={14} />
              )}
              <span>{editId ? 'Update & Save Story' : 'Publish Story'}</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`flex items-center justify-between border-b px-6 py-3 text-xs font-medium transition ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="font-semibold">{feedback.message}</span>
            </div>
            {feedback.publishedSlug && (
              <div className="flex items-center gap-3">
                <Link
                  href={`/news/${feedback.publishedSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-emerald-400"
                >
                  <ExternalLink size={12} />
                  View Published Story
                </Link>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-emerald-400/80 hover:text-emerald-200 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* Studio Workspace Content */}
        <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
          {/* LEFT PANE: Full Article Editor */}
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
              activeTab === 'preview' ? 'hidden' : activeTab === 'split' ? 'w-full lg:w-1/2 border-r border-slate-800/80' : 'w-full'
            }`}
          >
            <div className={`mx-auto w-full space-y-6 pb-24 transition-all duration-300 ${activeTab === 'editor' ? 'max-w-7xl 2xl:max-w-[1550px]' : 'max-w-4xl'}`}>
              {/* Card 1: Headline & Core Metadata */}
              <div className="rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-teal-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Story Essentials
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Step 1 of 6</span>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Story Headline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Reserve Bank Unveils Comprehensive Framework for Digital Asset Settlements"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm sm:text-base font-bold text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Slug, Category, Author, Tags in Optimized Pixel-Perfect Responsive Grid */}
                <div className={`grid gap-4 ${activeTab === 'editor' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {/* Column 1: Slug with Auto Toggle */}
                  <div>
                    <div className="flex h-6 items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">URL Slug</label>
                      <button
                        type="button"
                        onClick={() => setAutoSlug(!autoSlug)}
                        className={`text-[11px] font-semibold transition ${autoSlug ? 'text-teal-400' : 'text-slate-400 hover:text-white'}`}
                      >
                        {autoSlug ? '✓ Auto' : '✏️ Manual'}
                      </button>
                    </div>
                    <div className="flex h-10 items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 text-xs transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                      <span className="text-slate-500 select-none mr-1 font-mono text-[11px]">/news/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setAutoSlug(false);
                          setSlug(slugify(e.target.value));
                        }}
                        className="w-full bg-transparent font-mono text-teal-300 outline-none placeholder-slate-600 font-semibold text-xs"
                        placeholder="story-url-slug"
                      />
                    </div>
                  </div>

                  {/* Column 2: Desk Category */}
                  <div>
                    <div className="flex h-6 items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Desk Category</label>
                      <span className="text-[10px] text-teal-400/80 font-medium">Verified Desk</span>
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 text-xs font-bold text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 capitalize cursor-pointer"
                    >
                      {CATEGORY_ORDER.map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabel(cat)} Desk
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Column 3: Author / Desk Byline */}
                  <div>
                    <div className="flex h-6 items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Author Byline</label>
                      <span className="text-[10px] text-slate-500">Press Desk</span>
                    </div>
                    <div className="relative flex h-10 items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                      <User size={13} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="PolicyDrift Editorial Desk"
                        className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Column 4: Story Tags */}
                  <div>
                    <div className="flex h-6 items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Story Tags</label>
                      <span className="text-[10px] text-slate-500">Keywords</span>
                    </div>
                    <div className="relative flex h-10 items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                      <Tag size={13} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Policy, Finance, Markets"
                        className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Lead Deck / Excerpt */}
              <div className="rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Quote size={16} className="text-teal-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Lead Summary & Editorial Deck
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{excerpt.length} characters</span>
                </div>
                <p className="text-xs text-slate-400">
                  Concise 1–2 sentence lead overview for search previews, social cards, and article overview decks.
                </p>
                <textarea
                  rows={2}
                  placeholder="e.g., The monetary authority has published standardized operational guidelines for institutional digital settlements and sovereign liquidity buffers."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-3.5 text-xs sm:text-sm leading-relaxed text-slate-200 placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Card 3: Multi-Image Upload & Editorial Media Gallery */}
              <div className="rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-teal-400" />
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Image Upload & Media Gallery
                      </h2>
                      <p className="text-[11px] text-slate-400">Upload multiple images, pick cover hero, or insert into story narrative</p>
                    </div>
                  </div>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
                    >
                      Clear Main Hero
                    </button>
                  )}
                </div>

                {/* Drag & Drop Multi-Image Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition ${
                    dragOver
                      ? 'border-teal-400 bg-teal-500/10'
                      : 'border-slate-700/80 bg-slate-900/50 hover:border-teal-500/60 hover:bg-slate-900/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files) handleFileUpload(e.target.files);
                    }}
                    className="hidden"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/25 transition duration-300 shadow-md">
                    {uploading ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <UploadCloud size={20} />
                    )}
                  </div>

                  <h3 className="mt-2 text-xs sm:text-sm font-bold text-white">
                    {uploading ? uploadProgress : 'Click to Upload Images or Drag & Drop'}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Supports selecting multiple files (PNG, JPG, WEBP, GIF, SVG up to 25MB each)
                  </p>
                </div>

                {/* Uploaded Image Gallery Grid */}
                {galleryImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Story Media Gallery ({galleryImages.length} Image{galleryImages.length === 1 ? '' : 's'})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Click ⭐ to set as Main Cover or 📝 to insert in body
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {galleryImages.map((img, idx) => {
                        const isMainCover = imageUrl === img.url;
                        return (
                          <div
                            key={img.url + idx}
                            className={`group relative rounded-xl border p-3 flex flex-col justify-between transition overflow-hidden ${
                              isMainCover
                                ? 'border-teal-500 bg-teal-500/15 ring-2 ring-teal-500/30'
                                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-950 mb-2">
                              <img
                                src={img.url}
                                alt={img.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              {isMainCover && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-md">
                                  <Star size={10} className="fill-slate-950" />
                                  Main Cover
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-white truncate" title={img.name}>
                                {img.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{img.url}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setImageUrl(img.url)}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                                    isMainCover
                                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                                      : 'bg-slate-800 text-slate-300 hover:bg-teal-500/20 hover:text-teal-300'
                                  }`}
                                  title="Set as Main Hero Image"
                                >
                                  <Star size={11} className={isMainCover ? 'fill-slate-950' : ''} />
                                  Cover
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleInsertImageToBody(img.url, img.name)}
                                  className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-1 transition"
                                  title="Insert image markdown into story text"
                                >
                                  <FilePlus size={11} />
                                  Insert
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyUrl(img.url)}
                                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Copy URL"
                                >
                                  {copiedUrl === img.url ? (
                                    <Check size={13} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(img.url)}
                                className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Remove image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct URL Input Fallback */}
                <div>
                  <div className="flex h-6 items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Direct Hero Cover Image URL (HTTPS)
                    </label>
                    <span className="text-[10px] text-slate-500">Unsplash / CDN / External</span>
                  </div>
                  <div className="relative flex h-10 items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                    <Link2 size={13} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>

                {/* Curated Presets Grid */}
                <div>
                  <div className="flex h-6 items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Curated 1-Click Editorial Presets
                    </span>
                    <span className="text-[10px] text-teal-400/80 font-medium">8 Verified Editorial Assets</span>
                  </div>
                  <div className={`grid gap-3 ${activeTab === 'editor' ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8' : 'grid-cols-2 sm:grid-cols-4'}`}>
                    {IMAGE_PRESETS.map((preset) => {
                      const isSelected = imageUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleAddPresetToGallery(preset)}
                          className={`group relative flex flex-col items-start rounded-xl border p-2.5 text-left transition overflow-hidden ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500/15 ring-2 ring-teal-500/30'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="h-16 w-full rounded-lg overflow-hidden mb-2 bg-slate-800 relative">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-md">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <span className="line-clamp-1 text-xs font-bold text-slate-200 group-hover:text-teal-300 transition">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 capitalize">{preset.category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Twin Cards: Key Takeaways & Story Timeline in Side-by-Side Responsive Grid */}
              <div className={`grid gap-6 ${activeTab === 'editor' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Card 4: Key Takeaways Builder */}
                <div className="rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-teal-400" />
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Key Takeaways & Highlights
                        </h2>
                        <p className="text-[11px] text-slate-400">High-impact summary bullet points</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTakeaway}
                      className="flex items-center gap-1 rounded-xl bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-300 transition hover:bg-teal-500/20 border border-teal-500/30 active:scale-95"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add Point</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {takeaways.map((point, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300 border border-teal-500/30">
                          {index + 1}
                        </span>
                        <textarea
                          rows={1}
                          value={point}
                          onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                          placeholder={`Takeaway point #${index + 1}...`}
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-teal-500"
                        />
                        {takeaways.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTakeaway(index)}
                            className="mt-2 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove point"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 5: Chronological Timeline Builder */}
                <div className="rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-cyan-400" />
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Interactive Story Timeline
                        </h2>
                        <p className="text-[11px] text-slate-400">Chronological developments & milestones</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTimelineItem}
                      className="flex items-center gap-1 rounded-xl bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 border border-cyan-500/30 active:scale-95"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {timeline.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 transition hover:border-slate-700 shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="flex flex-1 items-center gap-2 w-full">
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => handleUpdateTimelineItem(index, 'time', e.target.value)}
                              placeholder="e.g., 10:30 AM"
                              className="w-28 sm:w-32 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-teal-300 outline-none focus:border-teal-500 font-mono"
                            />
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateTimelineItem(index, 'title', e.target.value)}
                              placeholder="Event headline..."
                              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-teal-500"
                            />
                          </div>
                          <div className="flex items-center gap-2.5 self-end sm:self-auto">
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isKeyMilestone}
                                onChange={(e) => handleUpdateTimelineItem(index, 'isKeyMilestone', e.target.checked)}
                                className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
                              />
                              Key
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveTimelineItem(index)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete milestone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={item.description || ''}
                          onChange={(e) => handleUpdateTimelineItem(index, 'description', e.target.value)}
                          placeholder="Detailed narrative context, quotes, or regulatory background..."
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs leading-relaxed text-slate-300 placeholder-slate-600 outline-none focus:border-teal-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 6: Complete Story Narrative Editor Suite (Full-Featured Pro) */}
              <div className={`rounded-2xl border border-slate-800/90 bg-[#0e1626]/80 p-4 sm:p-6 shadow-xl backdrop-blur-sm space-y-4 transition-all duration-300 ${
                isNarrativeFullscreen ? 'fixed inset-4 z-50 overflow-y-auto bg-slate-950 border-teal-500/50 shadow-2xl p-6' : ''
              }`}>
                {/* Header & Sub-Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-teal-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                          Complete Story Narrative (Markdown / HTML)
                        </h2>
                        {copiedNotification && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/40 animate-fade-in">
                            ✓ {copiedNotification}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">Pro-grade editorial suite with structured markdown, embedded media, and live preview</p>
                    </div>
                  </div>

                  {/* Mode Tabs & Fullscreen Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5">
                      <button
                        type="button"
                        onClick={() => setNarrativeTab('write')}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          narrativeTab === 'write' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Type size={13} />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setNarrativeTab('preview')}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          narrativeTab === 'preview' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Eye size={13} />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setNarrativeTab('split')}
                        className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          narrativeTab === 'split' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Columns size={13} />
                        Split
                      </button>
                    </div>

                    <button
                      type="button"
                      title={isNarrativeFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
                      onClick={() => setIsNarrativeFullscreen(!isNarrativeFullscreen)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      {isNarrativeFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Comprehensive Multi-Group Format Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/90 bg-slate-900/90 p-2 shadow-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Headings */}
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                      <button
                        type="button"
                        title="Heading 2 (Section)"
                        onClick={() => insertFormat('## ', '', 'Section Heading')}
                        className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded transition"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        title="Heading 3 (Subsection)"
                        onClick={() => insertFormat('### ', '', 'Subsection Heading')}
                        className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded transition"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        title="Heading 4 (Minor)"
                        onClick={() => insertFormat('#### ', '', 'Minor Heading')}
                        className="px-1.5 py-1 text-[11px] font-bold text-slate-400 hover:bg-slate-800 hover:text-teal-400 rounded transition"
                      >
                        H4
                      </button>
                    </div>

                    {/* Inline Typography */}
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                      <button
                        type="button"
                        title="Bold (Ctrl+B)"
                        onClick={() => insertFormat('**', '**', 'bold text')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        title="Italic (Ctrl+I)"
                        onClick={() => insertFormat('*', '*', 'italic text')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        title="Strikethrough"
                        onClick={() => insertFormat('~~', '~~', 'strikethrough text')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Strikethrough size={13} />
                      </button>
                      <button
                        type="button"
                        title="Inline Code (Ctrl+E)"
                        onClick={() => insertFormat('`', '`', 'code')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Code size={13} />
                      </button>
                    </div>

                    {/* Lists & Quotes */}
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                      <button
                        type="button"
                        title="Bullet List"
                        onClick={() => insertFormat('- ', '', 'List item')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <List size={13} />
                      </button>
                      <button
                        type="button"
                        title="Numbered List"
                        onClick={() => insertFormat('1. ', '', 'Numbered item')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <ListOrdered size={13} />
                      </button>
                      <button
                        type="button"
                        title="Task Checklist"
                        onClick={() => insertFormat('- [ ] ', '', 'Task item')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <CheckSquare size={13} />
                      </button>
                      <button
                        type="button"
                        title="Blockquote"
                        onClick={() => insertFormat('> ', '', 'Quoted statement')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Quote size={13} />
                      </button>
                    </div>

                    {/* Structure Blocks */}
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                      <button
                        type="button"
                        title="Insert Data Table"
                        onClick={() => insertFormat('\n\n| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Data 1 | Data 2 | Data 3 |\n| Data 4 | Data 5 | Data 6 |\n\n', '', '')}
                        className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded transition"
                      >
                        <Table size={13} />
                        Table
                      </button>
                      <button
                        type="button"
                        title="Horizontal Divider"
                        onClick={() => insertFormat('\n\n---\n\n', '', '')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                      >
                        <Minus size={13} />
                      </button>
                      <button
                        type="button"
                        title="Key Takeaway Note Box"
                        onClick={() => insertFormat('\n\n> [!NOTE]\n> **Key Insight:** Summary of the core strategic decision.\n\n', '', '')}
                        className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-semibold text-teal-300 hover:bg-slate-800 rounded transition"
                      >
                        <Info size={13} />
                        Callout
                      </button>
                    </div>

                    {/* Inserts: Links, Curated Images & Templates */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Insert Hyperlink (Ctrl+K)"
                        onClick={() => {
                          const url = prompt('Enter destination URL:', 'https://');
                          if (url) insertFormat('[', `](${url})`, 'link title');
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition"
                      >
                        <Link2 size={13} />
                        Link
                      </button>

                      {/* Curated Category Image Quick Drop */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCuratedPicker(!showCuratedPicker)}
                          className="flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-950/40 px-2 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-900/50 transition"
                        >
                          <ImageIcon size={13} />
                          Curated Images
                        </button>

                        {showCuratedPicker && (
                          <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl space-y-1">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 px-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insert Curated Photo</span>
                              <button
                                type="button"
                                onClick={() => setShowCuratedPicker(false)}
                                className="text-slate-500 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                              {IMAGE_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    insertFormat(`\n\n![${preset.name}](${preset.url})\n*Caption: ${preset.name} - ${preset.description}*\n\n`, '', '');
                                    setShowCuratedPicker(false);
                                  }}
                                  className="flex items-center gap-2 w-full p-1.5 rounded-lg hover:bg-slate-800 text-left transition text-xs group"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={preset.url} alt="" className="h-7 w-10 object-cover rounded border border-slate-700 shrink-0" />
                                  <div className="truncate">
                                    <div className="font-bold text-white truncate text-[11px] group-hover:text-teal-300">{preset.name}</div>
                                    <div className="text-[9px] text-slate-400 capitalize">{preset.category}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Journalistic Story Templates */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTemplatesMenu(!showTemplatesMenu)}
                          className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-900/50 transition"
                        >
                          <BookOpen size={13} />
                          Templates
                        </button>

                        {showTemplatesMenu && (
                          <div className="absolute left-0 top-full z-40 mt-1.5 w-64 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl space-y-1">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 px-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insert Story Template</span>
                              <button
                                type="button"
                                onClick={() => setShowTemplatesMenu(false)}
                                className="text-slate-500 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => insertStoryTemplate('standard')}
                              className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 transition"
                            >
                              <div className="text-xs font-bold text-white">Standard Policy Report</div>
                              <div className="text-[10px] text-slate-400">Summary, Findings, Quotes, Outlook</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertStoryTemplate('breaking')}
                              className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 transition"
                            >
                              <div className="text-xs font-bold text-rose-300">Breaking News Fast Wire</div>
                              <div className="text-[10px] text-slate-400">Immediate bullet points & verify hook</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertStoryTemplate('deepdive')}
                              className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 transition"
                            >
                              <div className="text-xs font-bold text-cyan-300">Investigative Deep-Dive</div>
                              <div className="text-[10px] text-slate-400">Data tables, macroeconomic levers</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertStoryTemplate('interview')}
                              className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 transition"
                            >
                              <div className="text-xs font-bold text-amber-300">Executive Q&A Interview</div>
                              <div className="text-[10px] text-slate-400">Structured question & quote blocks</div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Copy HTML / Copy Markdown / Clean */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      title="Copy as clean HTML"
                      onClick={copyAsHtml}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Copy size={12} />
                      HTML
                    </button>
                    <button
                      type="button"
                      title="Copy raw markdown"
                      onClick={copyAsMarkdown}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Copy size={12} />
                      MD
                    </button>
                    <button
                      type="button"
                      title="Clear narrative content"
                      onClick={() => {
                        if (confirm('Clear entire narrative text?')) setBody('');
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                    >
                      <Eraser size={13} />
                    </button>
                  </div>
                </div>

                {/* Editor Surface (Write / Preview / Split) */}
                <div className={`grid gap-4 ${narrativeTab === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Write Pane */}
                  {(narrativeTab === 'write' || narrativeTab === 'split') && (
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        rows={isNarrativeFullscreen ? 24 : 14}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={handleNarrativeKeyDown}
                        placeholder="Draft your comprehensive journalism narrative here. Multi-paragraph markdown, analysis, expert quotes, tables, and images are fully supported..."
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950 p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-200 placeholder-slate-600 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  )}

                  {/* In-Card Live Render Preview Pane */}
                  {(narrativeTab === 'preview' || narrativeTab === 'split') && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 sm:p-5 overflow-y-auto max-h-[500px] text-slate-200 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Live Formatted Preview</span>
                        <span className="text-teal-400 font-mono text-[10px]">Markdown Engine</span>
                      </div>

                      {body.trim() ? (
                        <RichStoryBody content={body} theme="dark" />
                      ) : (
                        <div className="py-12 text-center text-slate-600 text-xs">
                          Type markdown on the left or use the toolbar above to preview live rendering here.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Live Metrics & Productivity Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <span className="font-mono text-teal-400 font-bold">{narrativeWords}</span> Words
                    </span>
                    <span className="text-slate-600">·</span>
                    <span>
                      <span className="font-mono text-slate-300 font-bold">{narrativeChars}</span> Chars
                    </span>
                    <span className="text-slate-600">·</span>
                    <span>
                      <span className="font-mono text-slate-300 font-bold">{narrativeParagraphs}</span> Paragraphs
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1 text-teal-400 font-semibold">
                      <Clock size={12} />
                      ~{narrativeReadingTime} min read
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Ctrl+B Bold</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Ctrl+I Italic</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Ctrl+K Link</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Tab Indent</span>
                  </div>
                </div>
              </div>

              {/* Card 7: Editorial Visibility & Publication Controls (Clean & Short) */}
              <div className="rounded-xl border border-slate-800/90 bg-[#0e1626]/80 p-3.5 sm:p-4 shadow-lg backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders size={15} className="text-teal-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Editorial Controls
                    </h2>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">Visibility Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Status */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-teal-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-300">Status</span>
                    </div>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-semibold text-white outline-none transition focus:border-teal-500 cursor-pointer capitalize"
                    >
                      <option value="published">Published</option>
                      <option value="pending">Review</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Breaking News Toggle */}
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 transition duration-200 ${
                    isBreaking
                      ? 'border-rose-500/50 bg-rose-950/20 shadow-xs'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Flame size={14} className={isBreaking ? 'text-rose-400 fill-rose-400/20 animate-pulse' : 'text-slate-400'} />
                      <span className={`text-xs font-bold ${isBreaking ? 'text-rose-300' : 'text-slate-300'}`}>
                        Breaking
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBreaking && (
                        <select
                          value={breakingHours}
                          onChange={(e) => setBreakingHours(Number(e.target.value))}
                          className="rounded border border-rose-500/40 bg-slate-950 px-1.5 py-0.5 text-[11px] font-bold text-rose-300 outline-none"
                        >
                          <option value={2}>2h</option>
                          <option value={4}>4h</option>
                          <option value={8}>8h</option>
                          <option value={24}>24h</option>
                        </select>
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isBreaking}
                        onClick={() => setIsBreaking(!isBreaking)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isBreaking ? 'bg-rose-500' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isBreaking ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Featured Hero Toggle */}
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 transition duration-200 ${
                    isFeatured
                      ? 'border-amber-500/50 bg-amber-950/20 shadow-xs'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Star size={14} className={isFeatured ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                      <span className={`text-xs font-bold ${isFeatured ? 'text-amber-300' : 'text-slate-300'}`}>
                        Featured Hero
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isFeatured}
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isFeatured ? 'bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isFeatured ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Visual Story / Pinned Priority Toggle */}
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 transition duration-200 ${
                    editorialPriority === 'pinned'
                      ? 'border-fuchsia-500/50 bg-fuchsia-950/20 shadow-xs'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className={editorialPriority === 'pinned' ? 'text-fuchsia-400 fill-fuchsia-400' : 'text-slate-400'} />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${editorialPriority === 'pinned' ? 'text-fuchsia-300' : 'text-slate-300'}`}>
                          Visual Story
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      title="Pin story to #1 slide and cover photo in Visual Stories circle tray"
                      aria-checked={editorialPriority === 'pinned'}
                      onClick={() => setEditorialPriority(editorialPriority === 'pinned' ? 'normal' : 'pinned')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        editorialPriority === 'pinned' ? 'bg-fuchsia-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          editorialPriority === 'pinned' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky-Friendly Publication Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0c1220]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ready to Publish Story?</h3>
                    <p className="text-xs text-slate-400">
                      Target: <span className="font-semibold text-teal-300 capitalize">{categoryLabel(category)} Desk</span> · Status: <span className="font-semibold text-emerald-400 capitalize">{status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit('draft')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit('published')}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    <span>Publish Story Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Live PolicyDrift Real Reader Preview */}
          <div
            className={`flex-1 overflow-y-auto bg-[#f8fafc] text-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
              activeTab === 'editor' ? 'hidden' : activeTab === 'split' ? 'w-full lg:w-1/2' : 'w-full'
            }`}
          >
            <div className={`mx-auto w-full space-y-6 pb-20 transition-all duration-300 ${activeTab === 'preview' ? 'max-w-4xl lg:max-w-5xl' : 'max-w-2xl sm:max-w-3xl'}`}>
              {/* Clean Modern Preview Header */}
              <div className="flex items-center justify-between border-b border-slate-200/90 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-200/70 shadow-2xs">
                    <Eye size={14} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Live Reader Preview
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live simulation active" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200/70">
                    <Smartphone size={12} className="text-slate-400" />
                    <span>Responsive View</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs active:scale-95 cursor-pointer"
                    title="Close preview pane"
                  >
                    <X size={14} />
                    <span>Close Preview</span>
                  </button>
                </div>
              </div>

              {/* Reader Card Container */}
              <article className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                {/* Header Meta */}
                <header className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold shadow-xs ${categoryChipClass(category)}`}>
                      <CategoryGlyph name={category} className="h-3.5 w-3.5" />
                      <span>{categoryLabel(category)}</span>
                    </span>
                    {isBreaking && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse">
                        <Flame size={12} />
                        Breaking Alert
                      </span>
                    )}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 shadow-xs">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">Just now · 0 views</span>
                  </div>

                  <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-[2rem]">
                    {title || 'Your Story Headline Will Render Here'}
                  </h1>

                  {excerpt && (
                    <p className="text-base font-normal leading-relaxed text-slate-600">
                      {excerpt}
                    </p>
                  )}

                  {/* Byline */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 font-bold text-white text-[10px]">
                        PD
                      </div>
                      <span className="font-semibold text-slate-700">{author || 'PolicyDrift Editorial Desk'}</span>
                    </div>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </header>

                {/* Particle.news Style 3D Overlapping Image Stack or Single Hero */}
                {imageUrl && (
                  <ParticleStoryImageStack
                    mainImageSrc={imageUrl}
                    mainTitle={title || 'Article Hero Cover'}
                    category={category}
                    relatedImages={secondaryPreviewImages}
                  />
                )}

                {/* Key Takeaways Highlights */}
                {takeaways.filter((t) => t.trim().length > 0).length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 shadow-xs">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-teal-700" />
                      <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal-900">
                        Key Highlights
                      </h3>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 list-none p-0 m-0">
                      {takeaways
                        .filter((t) => t.trim().length > 0)
                        .map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                            <span className="font-medium">{point}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Story Timeline */}
                {timeline.filter((t) => t.title.trim().length > 0).length > 0 && (
                  <StoryTimeline
                    timeline={timeline.filter((t) => t.title.trim().length > 0)}
                    category={category}
                    storyTitle={title}
                  />
                )}

                {/* Story Body Paragraphs & Inline Images */}
                <div className="border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-800">
                  {body.trim() ? (
                    <RichStoryBody content={body} theme="light" />
                  ) : (
                    <p className="italic text-slate-400">Story body narrative will be formatted and displayed here...</p>
                  )}
                </div>

                {/* Tags Cloud */}
                {formattedTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
                    <Tag size={14} className="text-slate-400 mr-1" />
                    {formattedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>

        {/* Floating Quick Button to Open Live Preview when Editor is in Full Width Mode */}
        {activeTab === 'editor' && (
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className="fixed bottom-6 right-8 z-30 flex items-center gap-2 rounded-full border border-teal-500/50 bg-[#0c1220]/95 px-4 py-2.5 text-xs font-bold text-teal-300 shadow-2xl backdrop-blur-md transition hover:bg-teal-950 hover:border-teal-400 hover:scale-105 active:scale-95"
            title="Open Live Reader Preview Side-by-Side"
          >
            <PanelRightOpen size={16} className="text-teal-400" />
            <span>Open Live Preview</span>
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminCreateArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#070b14] text-teal-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <AdminCreateArticleContent />
    </Suspense>
  );
}
