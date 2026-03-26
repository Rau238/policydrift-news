import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function legalMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: { index: true, follow: true },
  };
}

export function LegalPageShell({ title, description, children }: Props) {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
        <header className="mt-8 border-b border-slate-200 pb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-slate-600">{description}</p>
          <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600">
            This is general information only, not legal advice. If you need help with your specific situation,
            consult a qualified professional.
          </p>
        </header>
        <div className="pd-legal-prose mt-10">{children}</div>
      </div>
    </div>
  );
}
