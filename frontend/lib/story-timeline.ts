export interface TimelineItem {
  id?: string | number;
  time: string;
  title: string;
  description?: string;
  isKeyMilestone?: boolean;
}

/**
 * Extracts structured timeline items from raw body if embedded.
 * Supports both JSON comment metadata and markdown formatted timeline lists.
 */
export function extractTimelineFromContent(rawText: string): TimelineItem[] {
  if (!rawText) return [];

  // 1. Check for structured JSON comment marker <!-- STORY_TIMELINE:[...] -->
  const match = rawText.match(/<!--\s*STORY_TIMELINE:([\s\S]*?)\s*-->/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || idx + 1,
          time: String(item.time || '').trim(),
          title: String(item.title || '').trim(),
          description: item.description ? String(item.description).trim() : '',
          isKeyMilestone: Boolean(item.isKeyMilestone || idx === 0 || idx === parsed.length - 1),
        })).filter((item) => item.time || item.title);
      }
    } catch {
      // fallback to markdown parsing
    }
  }

  // 2. Check for markdown timeline patterns like "Timeline:\n- 10:00 AM: Headline - Detail"
  const lines = rawText.split('\n');
  const items: TimelineItem[] = [];
  let inTimelineBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#+\s*Timeline/i.test(trimmed) || /^Timeline:/i.test(trimmed)) {
      inTimelineBlock = true;
      continue;
    }
    if (inTimelineBlock) {
      if (trimmed.startsWith('#') || trimmed === '---') {
        break;
      }
      const matchItem = trimmed.match(/^[-*•]\s*(?:\[([^\]]+)\]|([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|IST|UTC)?|[A-Za-z0-9\s,]+:))\s*(.*)/i);
      if (matchItem) {
        const timePart = (matchItem[1] || matchItem[2] || '').replace(/:$/, '').trim();
        const rest = (matchItem[3] || '').trim();
        const [titlePart, ...descParts] = rest.split(/[-–—]\s*/);
        items.push({
          id: items.length + 1,
          time: timePart || `Point ${items.length + 1}`,
          title: titlePart || rest,
          description: descParts.join(' - '),
          isKeyMilestone: items.length === 0,
        });
      }
    }
  }

  return items;
}
