import { Facebook, Github, GraduationCap, Linkedin, Mail } from 'lucide-react';
import type { Link } from '@/data/profile';

const ICONS = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  scholar: GraduationCap,
};

export function LinkIcon({ icon, className }: { icon: Link['icon']; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" className={className} />;
}
