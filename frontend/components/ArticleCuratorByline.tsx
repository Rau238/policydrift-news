import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { curatorBioShort, curatorImageSrc, curatorName, curatorProfileUrl, curatorRole } from '@/lib/site-trust';

/** Compact single-line curator credit (not a heavy card). */
export function ArticleCuratorByline() {
  const name = curatorName();
  const role = curatorRole();
  const bio = curatorBioShort();
  const href = curatorProfileUrl();
  const img = curatorImageSrc();

  return (
    <aside
      className="flex items-center gap-2.5 border-b border-slate-100 pb-4"
      aria-label="Article curator"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        {img ? (
          <Image
            src={img}
            alt={name}
            title={name}
            width={32}
            height={32}
            className="h-full w-full object-cover"
            unoptimized={img.startsWith('http://')}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-400" aria-hidden>
            <UserRound className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-tight text-slate-700">
          <span className="font-medium text-slate-500">Curated by </span>
          {href ? (
            <Link href={href} className="font-semibold text-ink transition hover:text-accent">
              {name}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{name}</span>
          )}
          <span className="text-slate-400"> · {role}</span>
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500" title={bio}>
          {bio}
        </p>
      </div>
    </aside>
  );
}
