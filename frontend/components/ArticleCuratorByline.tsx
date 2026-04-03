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
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200/90 ring-1 ring-slate-200">
        {img ? (
          <Image
            src={img}
            alt={name}
            title={name}
            width={36}
            height={36}
            className="h-full w-full object-cover"
            unoptimized={img.startsWith('http://')}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-500" aria-hidden>
            <UserRound className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Curated by</p>
        <p className="mt-0.5 font-sans text-[13px] font-semibold leading-tight text-ink">
          {href ? (
            <Link href={href} className="transition hover:text-accent">
              {name}
            </Link>
          ) : (
            name
          )}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-slate-500">{role}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600">{bio}</p>
      </div>
    </>
  );

  return (
    <aside
      className="mt-3 flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2"
      aria-label="Article curator"
    >
      {inner}
    </aside>
  );
}
