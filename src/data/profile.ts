// Everything about you that the site shows, in one place.
// Edit this file to update Home, Research, Projects and CV.
// Any list left empty hides its section automatically.

export interface Link {
  label: string;
  href: string;
  icon: 'mail' | 'github' | 'linkedin' | 'facebook' | 'scholar';
}

export interface NewsItem {
  date: string; // shown as written, e.g. "Mar 2026"
  text: string;
  href?: string;
}

export interface Publication {
  title: string;
  authors: string[]; // your own name is bolded automatically
  venue?: string; // e.g. "ACL 2026" — leave out while unpublished
  status?: string; // e.g. "Under review"
  year: number;
  summary?: string;
  selected?: boolean; // shown on Home
  links: { label: string; href: string }[];
}

export interface TimelineEntry {
  title: string;
  org: string;
  period: string;
  location?: string;
  details?: string[];
}

export interface Project {
  name: string;
  category: 'Research' | 'Tools & apps';
  description: string;
  tech: string[];
  links: { label: string; href: string }[];
}

export const profile = {
  name: 'Nguyễn Gia Bách',
  authorName: 'Gia-Bach Nguyen', // how your name appears in author lists
  photo: '/img/ngjabach.jpg',
  roles: ['B.Sc. Computer Science, HUST', 'Junior Researcher, Business AI Lab, NEU'],
  location: 'Hanoi, Vietnam',
  email: 'ngbach2008@gmail.com',
  cvPdf: '' as string, // e.g. '/cv.pdf' once the file is in /public
  links: [
    { label: 'Email', href: 'mailto:ngbach2008@gmail.com', icon: 'mail' },
    { label: 'GitHub', href: 'https://github.com/ngjabach', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ngjabach', icon: 'linkedin' },
    { label: 'Facebook', href: 'https://facebook.com/ngjabach', icon: 'facebook' },
  ] as Link[],
  bio: [
    'I am a Computer Science undergraduate at Hanoi University of Science and Technology and a junior researcher at the Business AI Lab, National Economics University.',
    'I work on machine learning and deep learning. My recent project, HERMES, predicts ICU outcomes from clinical notes alone by turning them into patient knowledge graphs and learning over them with graph attention networks.',
  ],
  interests: ['Machine Learning', 'Deep Learning', 'Graph Neural Networks', 'Clinical NLP'],
  researchStatement:
    'I am interested in models that reason over relationships rather than flat sequences, and in applying them where data is messy and stakes are high, such as healthcare.',
};

export const news: NewsItem[] = [
  { date: 'Mar 2026', text: 'Published a write-up of the HERMES project on the blog.', href: '/post/hermes-when-clinical-notes-become-a-knowledge-graph' },
  { date: 'Aug 2024', text: 'Joined the Business AI Lab, National Economics University, as a junior researcher.' },
  { date: 'Aug 2024', text: 'Started the B.Sc. in Computer Science at Hanoi University of Science and Technology.' },
  { date: 'Jun 2024', text: 'Completed the Informatics specialised class at Chu Van An National High School for the Gifted.' },
];

export const publications: Publication[] = [
  {
    title: 'HERMES: When Clinical Notes Become a Knowledge Graph',
    authors: [
      'Gia-Bach Nguyen', 'Hoang-Ha Nguyen', 'Tuan-Cuong Vuong', 'Trang Mai Xuan',
      'Duy Quoc Ngo', 'Tien-Cuong Nguyen', 'Huan Vu', 'Thien Van Luong',
    ],
    year: 2026,
    summary:
      'Text-only ICU outcome prediction: per-patient knowledge graphs built from clinical notes with LLM-guided extraction and contrastive logic, encoded by a graph attention network. Evaluated on MIMIC-III and MIMIC-IV.',
    selected: true,
    links: [{ label: 'Blog write-up', href: '/post/hermes-when-clinical-notes-become-a-knowledge-graph' }],
  },
];

export const ongoingWork: { name: string; org: string; description: string }[] = [];

export const education: TimelineEntry[] = [
  { title: 'B.Sc. in Computer Science', org: 'Hanoi University of Science and Technology', period: 'Aug 2024 – present', location: 'Hanoi, Vietnam' },
  { title: 'Informatics specialised class', org: 'Chu Van An National High School for the Gifted', period: 'Sep 2021 – Jun 2024', location: 'Hanoi, Vietnam' },
];

export const researchExperience: TimelineEntry[] = [
  {
    title: 'Junior Researcher',
    org: 'Business AI Lab, National Economics University',
    period: 'Aug 2024 – present',
    location: 'Hanoi, Vietnam',
    details: [
      'HERMES: text-only clinical outcome prediction with per-patient knowledge graphs and graph attention networks (MIMIC-III, MIMIC-IV).',
    ],
  },
];

export const workExperience: TimelineEntry[] = [];

export const awards: { title: string; detail: string; year: string }[] = [];

export const service: { title: string; detail: string; year: string }[] = [];

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['Python', 'C++', 'LaTeX'] },
  { group: 'Machine learning', items: ['Machine Learning', 'Deep Learning', 'Graph Neural Networks', 'Data Visualization'] },
  { group: 'Other', items: ['Research', 'Technical Writing', 'Competitive Programming'] },
];

export const projects: Project[] = [
  {
    name: 'HERMES',
    category: 'Research',
    description: 'Knowledge-graph pipeline and graph attention models for predicting clinical outcomes from notes.',
    tech: ['Python', 'Graph Neural Networks', 'LLMs'],
    links: [{ label: 'Write-up', href: '/post/hermes-when-clinical-notes-become-a-knowledge-graph' }],
  },
  {
    name: 'Personal website',
    category: 'Tools & apps',
    description: 'This site: CV and blog with a markdown editor, math and code rendering, dark and light themes. Originally built by Dek, now maintained by me.',
    tech: ['Next.js', 'MongoDB', 'Tailwind CSS'],
    links: [{ label: 'Code', href: 'https://github.com/hoanghero125/ngjabach-blog' }],
  },
];
