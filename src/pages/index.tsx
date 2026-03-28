import Link from 'next/link';
import { Mail, Linkedin, Github, Facebook } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[#FAF9F6] flex flex-col">
      <div className="px-4 py-4 flex-grow">
        <div className="max-w-[1325px] mx-auto">

          {/* Hero */}
          <section className="mb-6 mt-8">
            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-10 md:gap-16">

                {/* Avatar + Social */}
                <div className="flex flex-col items-center md:items-start flex-shrink-0">
                  <img
                    src="/img/ngjabach.jpg"
                    alt="Nguyen Gia Bach"
                    className="w-48 h-48 md:w-[320px] md:h-[320px] rounded-full object-cover ring-4 ring-gray-100 shadow-md mb-5"
                  />
                  <div className="w-full md:w-72 space-y-1.5">
                    {[
                      { href: 'mailto:ngbach2008@gmail.com', icon: <Mail className="h-4 w-4 text-blue-500" />, label: 'ngbach2008@gmail.com' },
                      { href: 'https://github.com/ngjabach', icon: <Github className="h-4 w-4 text-blue-500" />, label: 'NgJaBach', external: true },
                      { href: 'https://linkedin.com/in/ngjabach', icon: <Linkedin className="h-4 w-4 text-blue-500" />, label: 'ngjabach', external: true },
                      { href: 'https://facebook.com/ngjabach', icon: <Facebook className="h-4 w-4 text-blue-500" />, label: 'Nguyễn Gia Bách', external: true },
                    ].map(({ href, icon, label, external }) => (
                      <a
                        key={href}
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md flex-shrink-0">
                          {icon}
                        </div>
                        <span className="text-sm text-black truncate">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-8">

                  {/* Header */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500">About Me</span>
                    <h1 className="text-5xl font-extrabold italic mt-2 mb-2">Nguyễn Gia Bách</h1>
                    <p className="text-sm text-gray-400 mb-3">19 years old · Hanoi, Vietnam</p>
                    <p className="text-base text-gray-600">I have a PHD (Pretty Huge Dream) in Computer Science.</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Skills & Expertise</span>
                      <div className="h-px bg-gray-100 flex-grow" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['C++', 'Python', 'LaTeX', 'Competitive Programming', 'Machine Learning', 'Deep Learning', 'Data Visualization', 'Research', 'Technical Writing'].map((skill) => (
                        <span key={skill} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Education</span>
                      <div className="h-px bg-gray-100 flex-grow" />
                    </div>
                    <div className="space-y-5">
                      {[
                        { title: 'Informatics', org: 'Chu Van An National High School for the Gifted', location: 'Hanoi, Vietnam', period: 'Sep. 2021 – Jun 2024' },
                        { title: 'Bachelor of Science in Computer Science', org: 'Hanoi University of Science and Technology', location: 'Hanoi, Vietnam', period: 'Aug. 2024 – Present' },
                      ].map((item) => (
                        <div key={item.title} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p className="font-bold text-black">{item.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{item.org}</p>
                          </div>
                          <div className="sm:text-right flex-shrink-0">
                            <p className="text-sm text-blue-500 font-light italic">{item.location}</p>
                            <p className="text-sm text-gray-400 font-light italic mt-0.5">{item.period}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Experience</span>
                      <div className="h-px bg-gray-100 flex-grow" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <p className="font-bold text-black">Junior Researcher</p>
                        <p className="text-sm text-gray-500 mt-0.5">Business AI Lab – National Economics University</p>
                      </div>
                      <div className="sm:text-right flex-shrink-0">
                        <p className="text-sm text-blue-500 font-light italic">Hanoi, Vietnam</p>
                        <p className="text-sm text-gray-400 font-light italic mt-0.5">Aug. 2024 – Present</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-extrabold leading-none">Publications</h2>
              <div className="h-[2px] bg-gray-200 flex-grow" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-10">
              <p className="text-2xl font-bold italic text-center text-gray-400">Coming soon...</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
