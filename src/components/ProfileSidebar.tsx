import Link from 'next/link';
import { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { profile } from '@/data/profile';
import { LinkIcon } from '@/components/Icons';

interface Props {
  /** Extra block under the profile, e.g. an "On this page" list. */
  children?: ReactNode;
  /** Show the social links (Home); other pages show a section list instead. */
  showLinks?: boolean;
}

export default function ProfileSidebar({ children, showLinks = true }: Props) {
  return (
    <aside aria-label="Profile" className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="h-24 w-24 shrink-0 rounded-[22px] border-2 border-accent object-cover shadow-glow lg:h-[168px] lg:w-[168px] lg:rounded-[28px]"
        />
        <div>
          <p className="mb-1.5 font-logo text-[28px] leading-tight lg:text-[30px]">{profile.name}</p>
          <p className="text-sm leading-relaxed text-muted">
            {profile.roles.map((role) => (
              <span key={role} className="block">
                {role}
              </span>
            ))}
            <span className="block">{profile.location}</span>
          </p>
        </div>
      </div>

      {showLinks && (
        <ul className="flex flex-wrap gap-x-5 lg:flex-col lg:gap-0">
          {profile.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex min-h-10 items-center gap-2.5 text-sm text-ink transition-colors hover:text-accent-ink"
              >
                <LinkIcon icon={link.icon} className="h-[18px] w-[18px]" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {children}

      {profile.cvPdf ? (
        <a
          href={profile.cvPdf}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-bold text-on-accent transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" /> Download CV
        </a>
      ) : (
        <Link
          href="/cv"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-bold text-on-accent transition-opacity hover:opacity-90"
        >
          View CV
        </Link>
      )}
    </aside>
  );
}
