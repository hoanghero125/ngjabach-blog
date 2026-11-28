import type { SiteContent } from './schema';

// Built-in content. The site shows this for any section that has never been
// saved in Admin → Site content, and whenever the database is unreachable.
// Once a section is saved in the admin, the saved version is used instead.

const HERMES_POST = '/post/hermes-when-clinical-notes-become-a-knowledge-graph';

export const DEFAULT_SITE: SiteContent = {
  profile: {
    name: 'Nguyễn Gia Bách',
    authorName: 'Gia-Bach Nguyen',
    photo: '/img/ngjabach.jpg',
    roles: ['B.Sc. Computer Science, HUST', 'Junior Researcher, Business AI Lab, NEU'],
    location: 'Hanoi, Vietnam',
    email: 'ngbach2008@gmail.com',
    cvPdf: '',
    bio: [
      'I am a Computer Science undergraduate at Hanoi University of Science and Technology and a junior researcher at the Business AI Lab, National Economics University.',
      'I work on machine learning and deep learning. My recent project, HERMES, predicts ICU outcomes from clinical notes alone by turning them into patient knowledge graphs and learning over them with graph attention networks.',
    ],
    interests: ['Machine Learning', 'Deep Learning', 'Graph Neural Networks', 'Clinical NLP'],
    researchStatement:
      'I am interested in models that reason over relationships rather than flat sequences, and in applying them where data is messy and stakes are high, such as healthcare.',
    links: [
      { label: 'Email', href: 'mailto:ngbach2008@gmail.com', icon: 'mail' },
      { label: 'GitHub', href: 'https://github.com/ngjabach', icon: 'github' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/ngjabach', icon: 'linkedin' },
      { label: 'Facebook', href: 'https://facebook.com/ngjabach', icon: 'facebook' },
    ],
  },
  news: [
    { date: 'Mar 2026', text: 'Published a write-up of the HERMES project on the blog.', href: HERMES_POST },
    { date: 'Aug 2024', text: 'Joined the Business AI Lab, National Economics University, as a junior researcher.', href: '' },
    { date: 'Aug 2024', text: 'Started the B.Sc. in Computer Science at Hanoi University of Science and Technology.', href: '' },
    { date: 'Jun 2024', text: 'Completed the Informatics specialised class at Chu Van An National High School for the Gifted.', href: '' },
  ],
  publications: [
    {
      title: 'HERMES: When Clinical Notes Become a Knowledge Graph',
      authors: [
        'Gia-Bach Nguyen', 'Hoang-Ha Nguyen', 'Tuan-Cuong Vuong', 'Trang Mai Xuan',
        'Duy Quoc Ngo', 'Tien-Cuong Nguyen', 'Huan Vu', 'Thien Van Luong',
      ],
      venue: '',
      status: '',
      year: 2026,
      summary:
        'Text-only ICU outcome prediction: per-patient knowledge graphs built from clinical notes with LLM-guided extraction and contrastive logic, encoded by a graph attention network. Evaluated on MIMIC-III and MIMIC-IV.',
      selected: true,
      links: [{ label: 'Blog write-up', href: HERMES_POST }],
    },
  ],
  ongoingWork: [],
  education: [
    { title: 'B.Sc. in Computer Science', org: 'Hanoi University of Science and Technology', period: 'Aug 2024 – present', location: 'Hanoi, Vietnam', details: [] },
    { title: 'Informatics specialised class', org: 'Chu Van An National High School for the Gifted', period: 'Sep 2021 – Jun 2024', location: 'Hanoi, Vietnam', details: [] },
  ],
  researchExperience: [
    {
      title: 'Junior Researcher',
      org: 'Business AI Lab, National Economics University',
      period: 'Aug 2024 – present',
      location: 'Hanoi, Vietnam',
      details: ['HERMES: text-only clinical outcome prediction with per-patient knowledge graphs and graph attention networks (MIMIC-III, MIMIC-IV).'],
    },
  ],
  workExperience: [],
  awards: [],
  service: [],
  skills: [
    { group: 'Languages', items: ['Python', 'C++', 'LaTeX'] },
    { group: 'Machine learning', items: ['Machine Learning', 'Deep Learning', 'Graph Neural Networks', 'Data Visualization'] },
    { group: 'Other', items: ['Research', 'Technical Writing', 'Competitive Programming'] },
  ],
  projects: [
    {
      name: 'HERMES',
      category: 'Research',
      description: 'Knowledge-graph pipeline and graph attention models for predicting clinical outcomes from notes.',
      tech: ['Python', 'Graph Neural Networks', 'LLMs'],
      links: [{ label: 'Write-up', href: HERMES_POST }],
    },
    {
      name: 'Personal website',
      category: 'Tools & apps',
      description: 'This site: CV and blog with a markdown editor, math and code rendering, dark and light themes. Originally built by Dek, now maintained by me.',
      tech: ['Next.js', 'MongoDB', 'Tailwind CSS'],
      links: [{ label: 'Code', href: 'https://github.com/hoanghero125/ngjabach-blog' }],
    },
  ],
};
