// The single description of everything editable under Admin → Site content.
// The admin forms are generated from it and the server validates against it,
// so the two can never disagree. To add a field: add it here (and, if the
// public pages should show it, use it there). Nothing else needs changing.

export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'number' | 'checkbox' | 'select' | 'lines' | 'media' | 'list';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Max characters (strings, each line) or max value (numbers). */
  max?: number;
  /** Min value (numbers). */
  min?: number;
  /** Max entries (lines, lists). */
  maxItems?: number;
  options?: readonly string[];
  /** media: which files may be chosen. */
  accept?: 'image' | 'pdf';
  help?: string;
  /** list: the fields of one entry. */
  fields?: Field[];
  /** list: what one entry is called ("link", "news item"). */
  itemLabel?: string;
  /** Value for a newly added entry. */
  default?: unknown;
}

export const SECTION_KEYS = [
  'profile', 'news', 'publications', 'ongoingWork', 'education', 'researchExperience',
  'workExperience', 'awards', 'service', 'skills', 'projects',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface Section {
  key: SectionKey;
  label: string;
  description: string;
  kind: 'object' | 'list';
  fields: Field[];
  maxItems?: number;
  itemLabel?: string;
  /** Public page that shows this section (for "View on site"). */
  page: string;
}

export const LINK_ICONS = ['mail', 'github', 'linkedin', 'facebook', 'scholar', 'website'] as const;
export const PROJECT_CATEGORIES = ['Research', 'Tools & apps'] as const;

const linkList = (label = 'Links', maxItems = 6): Field => ({
  key: 'links',
  label,
  type: 'list',
  maxItems,
  itemLabel: 'link',
  fields: [
    { key: 'label', label: 'Label', type: 'text', required: true, max: 40 },
    { key: 'href', label: 'URL', type: 'url', required: true, max: 500, help: 'https://…, mailto:… or a site path like /post/my-post' },
  ],
});

const timelineFields: Field[] = [
  { key: 'title', label: 'Title / degree / role', type: 'text', required: true, max: 150 },
  { key: 'org', label: 'Organisation', type: 'text', required: true, max: 150 },
  { key: 'period', label: 'Period', type: 'text', required: true, max: 60, help: 'e.g. Aug 2024 – present' },
  { key: 'location', label: 'Location', type: 'text', max: 100 },
  { key: 'details', label: 'Details (one bullet per line)', type: 'lines', maxItems: 8, max: 400 },
];

const rowFields: Field[] = [
  { key: 'title', label: 'Title', type: 'text', required: true, max: 150 },
  { key: 'detail', label: 'Detail', type: 'text', max: 200, help: 'e.g. the contest, course or event' },
  { key: 'year', label: 'Year', type: 'text', max: 20 },
];

export const SECTIONS: Section[] = [
  {
    key: 'profile',
    label: 'Profile',
    description: 'Your name, photo, roles, bio, research interests and links. Shown on every page.',
    kind: 'object',
    page: '/',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, max: 100 },
      { key: 'authorName', label: 'Name in author lists', type: 'text', max: 100, help: 'Bolded wherever it appears in a publication’s authors, e.g. Gia-Bach Nguyen' },
      { key: 'photo', label: 'Photo', type: 'media', accept: 'image', required: true },
      { key: 'roles', label: 'Roles (one per line)', type: 'lines', maxItems: 5, max: 120 },
      { key: 'location', label: 'Location', type: 'text', max: 100 },
      { key: 'email', label: 'Email', type: 'email', max: 200 },
      { key: 'cvPdf', label: 'CV PDF', type: 'media', accept: 'pdf', help: 'Optional. Adds a “Download CV” button.' },
      { key: 'bio', label: 'Bio (one paragraph per line)', type: 'lines', maxItems: 5, max: 1200 },
      { key: 'interests', label: 'Research interests (one per line)', type: 'lines', maxItems: 10, max: 60 },
      { key: 'researchStatement', label: 'Research statement (Research page)', type: 'textarea', max: 1500 },
      {
        key: 'links',
        label: 'Contact & social links',
        type: 'list',
        maxItems: 8,
        itemLabel: 'link',
        fields: [
          { key: 'label', label: 'Label', type: 'text', required: true, max: 40 },
          { key: 'href', label: 'URL', type: 'url', required: true, max: 500, help: 'https://… or mailto:you@example.com' },
          { key: 'icon', label: 'Icon', type: 'select', options: LINK_ICONS, required: true, default: 'website' },
        ],
      },
    ],
  },
  {
    key: 'news',
    label: 'News',
    description: 'Short dated updates on the Home page, newest first.',
    kind: 'list',
    page: '/',
    maxItems: 100,
    itemLabel: 'news item',
    fields: [
      { key: 'date', label: 'Date', type: 'text', required: true, max: 30, help: 'Shown as written, e.g. Mar 2026' },
      { key: 'text', label: 'Text', type: 'textarea', required: true, max: 400 },
      { key: 'href', label: 'Link (optional)', type: 'url', max: 500 },
    ],
  },
  {
    key: 'publications',
    label: 'Publications',
    description: 'Papers on the Research and CV pages. Tick “Show on Home” for selected ones.',
    kind: 'list',
    page: '/research',
    maxItems: 100,
    itemLabel: 'publication',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, max: 300 },
      { key: 'authors', label: 'Authors (one per line, in order)', type: 'lines', required: true, maxItems: 40, max: 100 },
      { key: 'venue', label: 'Venue', type: 'text', max: 120, help: 'e.g. ACL 2026' },
      { key: 'status', label: 'Status', type: 'text', max: 60, help: 'e.g. Under review. Leave empty once published.' },
      { key: 'year', label: 'Year', type: 'number', required: true, min: 1990, max: 2100, default: new Date().getFullYear() },
      { key: 'summary', label: 'Summary', type: 'textarea', max: 1000 },
      { key: 'selected', label: 'Show on Home', type: 'checkbox', default: false },
      linkList('Links (PDF, code, BibTeX…)'),
    ],
  },
  {
    key: 'ongoingWork',
    label: 'Ongoing work',
    description: 'Current projects on the Research page.',
    kind: 'list',
    page: '/research',
    maxItems: 20,
    itemLabel: 'project',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { key: 'org', label: 'Lab or collaborator', type: 'text', max: 120 },
      { key: 'description', label: 'Description', type: 'textarea', max: 600 },
    ],
  },
  { key: 'education', label: 'Education', description: 'CV page.', kind: 'list', page: '/cv', maxItems: 20, itemLabel: 'entry', fields: timelineFields },
  { key: 'researchExperience', label: 'Research experience', description: 'CV page.', kind: 'list', page: '/cv', maxItems: 30, itemLabel: 'entry', fields: timelineFields },
  { key: 'workExperience', label: 'Work experience', description: 'CV page.', kind: 'list', page: '/cv', maxItems: 30, itemLabel: 'entry', fields: timelineFields },
  { key: 'awards', label: 'Honors & awards', description: 'CV page (competitive programming results go here).', kind: 'list', page: '/cv', maxItems: 50, itemLabel: 'award', fields: rowFields },
  { key: 'service', label: 'Teaching & service', description: 'CV page.', kind: 'list', page: '/cv', maxItems: 50, itemLabel: 'entry', fields: rowFields },
  {
    key: 'skills',
    label: 'Skills',
    description: 'CV page, grouped.',
    kind: 'list',
    page: '/cv',
    maxItems: 12,
    itemLabel: 'group',
    fields: [
      { key: 'group', label: 'Group', type: 'text', required: true, max: 40 },
      { key: 'items', label: 'Skills (one per line)', type: 'lines', required: true, maxItems: 30, max: 50 },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    description: 'Cards on the Projects page.',
    kind: 'list',
    page: '/projects',
    maxItems: 50,
    itemLabel: 'project',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, max: 100 },
      { key: 'category', label: 'Category', type: 'select', options: PROJECT_CATEGORIES, required: true, default: 'Research' },
      { key: 'description', label: 'Description', type: 'textarea', max: 600 },
      { key: 'tech', label: 'Technologies (one per line)', type: 'lines', maxItems: 12, max: 40 },
      linkList('Links (code, demo, paper…)'),
    ],
  },
];

export const getSection = (key: string) => SECTIONS.find((s) => s.key === key);

/** An empty value for a field, used when adding entries in the admin. */
export function emptyValue(field: Field): unknown {
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case 'checkbox':
      return false;
    case 'number':
      return field.min ?? 0;
    case 'lines':
    case 'list':
      return [];
    default:
      return '';
  }
}

export function emptyItem(fields: Field[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]));
}

// ---- Types of the stored content (what the public pages read) ----

export interface LinkItem { label: string; href: string }
export interface ProfileLink extends LinkItem { icon: (typeof LINK_ICONS)[number] }
export interface Profile {
  name: string;
  authorName: string;
  photo: string;
  roles: string[];
  location: string;
  email: string;
  cvPdf: string;
  bio: string[];
  interests: string[];
  researchStatement: string;
  links: ProfileLink[];
}
export interface NewsItem { date: string; text: string; href: string }
export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  status: string;
  year: number;
  summary: string;
  selected: boolean;
  links: LinkItem[];
}
export interface OngoingWork { name: string; org: string; description: string }
export interface TimelineEntry { title: string; org: string; period: string; location: string; details: string[] }
export interface RowEntry { title: string; detail: string; year: string }
export interface SkillGroup { group: string; items: string[] }
export interface Project {
  name: string;
  category: (typeof PROJECT_CATEGORIES)[number];
  description: string;
  tech: string[];
  links: LinkItem[];
}

export interface SiteContent {
  profile: Profile;
  news: NewsItem[];
  publications: Publication[];
  ongoingWork: OngoingWork[];
  education: TimelineEntry[];
  researchExperience: TimelineEntry[];
  workExperience: TimelineEntry[];
  awards: RowEntry[];
  service: RowEntry[];
  skills: SkillGroup[];
  projects: Project[];
}
