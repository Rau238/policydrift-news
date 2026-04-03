import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { curatorBioShort, curatorImageSrc, curatorName, curatorProfileUrl, curatorRole } from '@/lib/site-trust';

export function ArticleCuratorByline() {
  const name = curatorName();
  const role = curatorRole();
  const bio = curatorBioShort();
  const href = curatorProfileUrl();
  const img = curatorImageSrc();

  const inner = (
    <>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white shadow-sm">
        {img ? (
          <Image
            src={img}
            alt={name}
            width={56}
            height={56}
            className="h-full w-full object-cover"
            unoptimized={img.startsWith('http://')}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-500" aria-hidden>
            <UserRound className="h-7 w-7" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Curated by</p>
        <p className="mt-0.5 font-display text-base font-bold text-ink">
          {href ? (
            <Link href={href} className="transition hover:text-accent">
              {name}
            </Link>
          ) : (
            name
          )}
        </p>
        <p className="text-[13px] font-medium text-slate-600">{role}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{bio}</p>
      </div>
    </>
  );

  return (
    <aside
      className="mt-4 flex gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3.5 shadow-sm"
      aria-label="Article curator"
    >
      {inner}
    </aside>
  );
}
