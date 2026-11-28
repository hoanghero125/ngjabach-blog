import { Facebook, Github, Globe, GraduationCap, Linkedin, Mail } from 'lucide-react';
import type { ProfileLink } from '@/lib/site/schema';

const ICONS = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  scholar: GraduationCap,
  website: Globe,
};

export function LinkIcon({ icon, className }: { icon: ProfileLink['icon']; className?: string }) {
  const Icon = ICONS[icon] || Globe;
  return <Icon aria-hidden="true" className={className} />;
}
