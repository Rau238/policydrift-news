'use client';

import React from 'react';
import { Info, AlertTriangle, Lightbulb, CheckCircle2, Quote, ExternalLink } from 'lucide-react';

interface RichStoryBodyProps {
  content: string | null | undefined;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * Parses inline markdown: **bold**, *italic*, ~~strikethrough~~, `code`, [title](url)
 */
function parseInlineMarkdown(text: string, isDark: boolean): React.ReactNode {
  if (!text) return null;

  // Split by inline markdown tokens
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className={`italic ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {part.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={index} className="line-through opacity-70">
          {part.slice(2, -2)}
        </del>
      );
    }

    // Inline Code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
            isDark ? 'bg-slate-800 text-teal-300 border border-slate-700' : 'bg-slate-100 text-teal-700 border border-slate-200'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link [Title](URL)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-0.5 font-semibold underline underline-offset-2 transition ${
            isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'
          }`}
        >
          {linkMatch[1]}
          <ExternalLink size={11} className="inline opacity-70" />
        </a>
      );
    }

    return part;
  });
}

export function RichStoryBody({ content, className = '', theme = 'light' }: RichStoryBodyProps) {
  if (!content || !content.trim()) return null;

  const isDark = theme === 'dark';

  // Strip timeline comment marker if present
  const cleanContent = content.replace(/<!--\s*STORY_TIMELINE:[\s\S]*?-->/g, '').trim();
  if (!cleanContent) return null;

  // Split narrative by double linebreaks or multi-line blocks
  const blocks = cleanContent.split(/\n{2,}/);

  return (
    <div className={`rich-story-narrative space-y-4 ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Heading 2 (## Heading)
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          return (
            <h2
              key={i}
              className={`font-display text-xl sm:text-2xl font-bold tracking-tight pt-4 pb-1 border-b ${
                isDark ? 'text-white border-slate-800' : 'text-slate-950 border-slate-200/80'
              }`}
            >
              {parseInlineMarkdown(headingText, isDark)}
            </h2>
          );
        }

        // 2. Heading 3 (### Heading)
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          return (
            <h3
              key={i}
              className={`font-display text-lg sm:text-xl font-bold tracking-tight pt-2 ${
                isDark ? 'text-teal-300' : 'text-teal-800'
              }`}
            >
              {parseInlineMarkdown(headingText, isDark)}
            </h3>
          );
        }

        // 3. Heading 4 (#### Heading)
        if (trimmed.startsWith('#### ')) {
          const headingText = trimmed.replace(/^####\s+/, '');
          return (
            <h4
              key={i}
              className={`text-sm sm:text-base font-bold uppercase tracking-wider pt-1 ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}
            >
              {parseInlineMarkdown(headingText, isDark)}
            </h4>
          );
        }

        // 4. Horizontal Divider (---)
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          return (
            <hr
              key={i}
              className={`my-6 border-0 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
            />
          );
        }

        // 5. Callout Alert Blocks (> [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT])
        if (/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i.test(trimmed)) {
          const match = trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(?:\n>\s*)?([\s\S]*)$/i);
          const calloutType = (match?.[1] || 'NOTE').toUpperCase();
          const calloutBody = match?.[2] ? match[2].replace(/^>\s*/gm, '').trim() : '';

          const config = {
            NOTE: {
              title: 'Editorial Note',
              icon: Info,
              border: isDark ? 'border-teal-500/40 bg-teal-950/30 text-teal-200' : 'border-teal-300 bg-teal-50/70 text-teal-900',
              badge: isDark ? 'text-teal-300' : 'text-teal-800',
            },
            TIP: {
              title: 'Key Takeaway',
              icon: Lightbulb,
              border: isDark ? 'border-amber-500/40 bg-amber-950/30 text-amber-200' : 'border-amber-300 bg-amber-50/70 text-amber-900',
              badge: isDark ? 'text-amber-300' : 'text-amber-800',
            },
            WARNING: {
              title: 'Regulatory Warning',
              icon: AlertTriangle,
              border: isDark ? 'border-rose-500/40 bg-rose-950/30 text-rose-200' : 'border-rose-300 bg-rose-50/70 text-rose-900',
              badge: isDark ? 'text-rose-300' : 'text-rose-800',
            },
            IMPORTANT: {
              title: 'Critical Briefing',
              icon: AlertTriangle,
              border: isDark ? 'border-purple-500/40 bg-purple-950/30 text-purple-200' : 'border-purple-300 bg-purple-50/70 text-purple-900',
              badge: isDark ? 'text-purple-300' : 'text-purple-800',
            },
            CAUTION: {
              title: 'Cautionary Advisory',
              icon: AlertTriangle,
              border: isDark ? 'border-orange-500/40 bg-orange-950/30 text-orange-200' : 'border-orange-300 bg-orange-50/70 text-orange-900',
              badge: isDark ? 'text-orange-300' : 'text-orange-800',
            },
          }[calloutType] || {
            title: 'Editorial Note',
            icon: Info,
            border: isDark ? 'border-teal-500/40 bg-teal-950/30 text-teal-200' : 'border-teal-300 bg-teal-50/70 text-teal-900',
            badge: isDark ? 'text-teal-300' : 'text-teal-800',
          };

          const IconComp = config.icon;

          return (
            <div key={i} className={`rounded-xl border p-4 my-3 shadow-xs ${config.border}`}>
              <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1.5 ${config.badge}`}>
                <IconComp size={15} />
                <span>{config.title}</span>
              </div>
              <div className="text-xs sm:text-sm leading-relaxed font-medium">
                {parseInlineMarkdown(calloutBody, isDark)}
              </div>
            </div>
          );
        }

        // 6. Blockquote (> Quote statement)
        if (trimmed.startsWith('> ')) {
          const lines = trimmed.split('\n').map((l) => l.replace(/^>\s*/, ''));
          const quoteText = lines.join('\n');
          return (
            <blockquote
              key={i}
              className={`relative border-l-4 my-4 pl-4 py-2.5 rounded-r-xl italic ${
                isDark
                  ? 'border-teal-500 bg-slate-900/60 text-slate-200'
                  : 'border-teal-600 bg-teal-50/50 text-slate-800'
              }`}
            >
              <div className="text-sm sm:text-base leading-relaxed">
                {parseInlineMarkdown(quoteText, isDark)}
              </div>
            </blockquote>
          );
        }

        // 7. Markdown Table (| Col 1 | Col 2 | ...)
        if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
          const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
          const headerLine = lines[0];
          const dataLines = lines.slice(1).filter((l) => l.replace(/[\s|:-]/g, '').length > 0);

          const parseRow = (line: string) =>
            line
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map((c) => c.trim());

          const headers = parseRow(headerLine);

          return (
            <div
              key={i}
              className={`my-4 overflow-x-auto rounded-xl border shadow-xs ${
                isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'
              }`}
            >
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className={isDark ? 'bg-slate-950 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200'}>
                    {headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className={`p-3 font-bold uppercase tracking-wider text-[11px] ${
                          isDark ? 'text-teal-300' : 'text-slate-800'
                        }`}
                      >
                        {parseInlineMarkdown(h, isDark)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {dataLines.map((row, rIdx) => {
                    const cells = parseRow(row);
                    return (
                      <tr
                        key={rIdx}
                        className={`transition ${
                          isDark
                            ? rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-950/40'
                            : rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50'
                        }`}
                      >
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className={`p-3 leading-normal ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {parseInlineMarkdown(cell, isDark)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // 8. Image Embed (![Alt](URL))
        const singleImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (singleImgMatch) {
          const altText = singleImgMatch[1];
          const imgSrc = singleImgMatch[2];
          return (
            <figure
              key={i}
              className={`my-5 overflow-hidden rounded-2xl border shadow-sm ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt={altText} className="w-full object-cover max-h-[460px]" loading="lazy" />
              {altText && (
                <figcaption
                  className={`p-2.5 text-center text-xs font-medium border-t ${
                    isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}
                >
                  {altText}
                </figcaption>
              )}
            </figure>
          );
        }

        // 9. Bulleted List (- item or * item)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={i} className={`list-disc pl-5 space-y-2 my-4 text-[15px] sm:text-[16px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {items.map((it, idx) => {
                const itemContent = it.replace(/^[-*]\s+/, '');
                // Checklist support
                if (itemContent.startsWith('[ ] ') || itemContent.startsWith('[x] ')) {
                  const checked = itemContent.startsWith('[x] ');
                  const text = itemContent.replace(/^\[[ x]\]\s+/, '');
                  return (
                    <li key={idx} className="list-none flex items-start gap-2 -ml-5">
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <CheckCircle2 size={12} />}
                      </span>
                      <span>{parseInlineMarkdown(text, isDark)}</span>
                    </li>
                  );
                }
                return <li key={idx}>{parseInlineMarkdown(itemContent, isDark)}</li>;
              })}
            </ul>
          );
        }

        // 10. Numbered List (1. item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => /^\d+\.\s+/.test(l.trim()));
          return (
            <ol key={i} className={`list-decimal pl-5 space-y-2 my-4 text-[15px] sm:text-[16px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {items.map((it, idx) => {
                const itemContent = it.replace(/^\d+\.\s+/, '');
                return <li key={idx}>{parseInlineMarkdown(itemContent, isDark)}</li>;
              })}
            </ol>
          );
        }

        // 11. Code Block (```lang ... ```)
        if (trimmed.startsWith('```')) {
          const codeLines = trimmed.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
          return (
            <pre
              key={i}
              className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs sm:text-sm leading-relaxed text-teal-300"
            >
              <code>{codeLines}</code>
            </pre>
          );
        }

        // 12. Standard Paragraph
        return (
          <p
            key={i}
            className={`text-[16px] sm:text-[17px] leading-[1.78] ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}
          >
            {parseInlineMarkdown(trimmed, isDark)}
          </p>
        );
      })}
    </div>
  );
}
