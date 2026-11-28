import { profile } from '@/data/profile';

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-5 text-center text-[13px] text-faint">
      © {new Date().getFullYear()} {profile.name} · Designed &amp; developed by{' '}
      <a
        href="https://github.com/hoanghero125"
        target="_blank"
        rel="noopener noreferrer"
        className="dek-font dek-hover-effects align-middle text-[20px] text-accent-ink transition-all duration-300"
      >
        Dek
      </a>{' '}
      <span aria-hidden="true">(◕‿◕)</span>
    </footer>
  );
}
