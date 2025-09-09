import Link from 'next/link';
import { Mail, Linkedin, Github, Facebook } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#FAF9F6] flex flex-col">
      <div className="px-4 py-4 flex-grow">
        <div className="max-w-[1325px] mx-auto">
          {/* About Me Section (including Skills & Expertise, Education, and Experience) */}
          <section className="mb-8">
            <h1 className="text-5xl font-bold mb-6">About Me</h1>
            <div className="bg-white p-16 rounded-xl shadow-sm">
              <div className="flex flex-col md:flex-row gap-18">
                {/* Avatar and Social Media */}
                <div className="flex flex-col items-start">
                  <img
                    src="/img/ngjabach.jpg"
                    alt="Nguyen Gia Bach"
                    className="w-[320px] h-[320px] rounded-full flex-shrink-0 mb-4 object-cover border-8 border-white drop-shadow-md"
                  />
                  <div className="w-[320px] space-y-2">
                    <a
                      href="mailto:ngbach2008@gmail.com"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">ngbach2008@gmail.com</span>
                    </a>
                    <a
                      href="https://github.com/ngjabach"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Github className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">NgJaBach</span>
                    </a>
                    <a
                      href="https://linkedin.com/in/ngjabach"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Linkedin className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">ngjabach</span>
                    </a>
                    <a
                      href="https://facebook.com/ngjabach"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Facebook className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">Nguyễn Gia Bách</span>
                    </a>
                  </div>
                </div>
                {/* Information, Description, Skills, Education, and Experience */}
                <div className="flex-1">
                  <h2 className="text-4xl font-bold italic mb-1">Nguyễn Gia Bách</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    19 years old • Hanoi, Vietnam VN
                  </p>
                  <div className="mb-6">
                    <p className="text-base mb-3">
                      I have a PHD (Pretty Huge Dream) in Computer Science.
                    </p>
                  </div>
                  {/* Skills & Expertise */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-4">
                      <h2 className="text-2xl font-bold whitespace-nowrap">Skills & Expertise</h2>
                      <hr className="border-gray-200 border-1 flex-grow" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        'C++',
                        'Python',
                        'LaTeX',
                        'Competitive Programming',
                        'Machine Learning',
                        'Deep Learning',
                        'Data Visualization',
                        'Research',
                        'Technical Writing',
                      ].map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Education */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-4">
                      <h2 className="text-2xl font-bold whitespace-nowrap">Education</h2>
                      <hr className="border-gray-200 border-1 flex-grow" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-bold text-black">
                            Informatics
                          </p>
                          <p className="text-base text-gray-500">
                            Chu Van An National High School for the Gifted
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base text-red-500 font-light italic">
                            Hanoi, Vietnam
                          </p>
                          <p className="text-base text-gray-500 font-light italic">
                            Sep. 2021 - Jun 2024
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-bold text-black">
                            Bachelor of Science in Computer Science
                          </p>
                          <p className="text-base text-gray-500">
                            Hanoi University of Science and Technology
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base text-red-500 font-light italic">
                            Hanoi, Vietnam
                          </p>
                          <p className="text-base text-gray-500 font-light italic">
                            Aug. 2024 - Present
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Experience */}
                  <div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <h2 className="text-2xl font-bold whitespace-nowrap">Experience</h2>
                      <hr className="border-gray-200 border-1 flex-grow" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-bold text-black">
                            Junior Researcher
                          </p>
                          <p className="text-base text-gray-500">
                            Business AI Lab - National Economics University
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base text-red-500 font-light italic">
                            Hanoi, Vietnam
                          </p>
                          <p className="text-base text-gray-500 font-light italic">
                            Aug. 2024 - Present
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* My Projects Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Projects</h2>
            <div className="bg-white p-10 rounded-xl shadow-sm">
              <p className="text-2xl font-bold italic text-center">Coming soon...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}