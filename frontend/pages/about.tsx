import Link from 'next/link';
import { Mail, Linkedin, Github, Facebook } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#FAF9F6] flex flex-col min-h-screen">
      <div className="px-4 py-4 flex-grow">
        <div className="max-w-[1325px] mx-auto">
          {/* About Me Section (including Skills & Expertise and Education) */}
          <section className="mb-8">
            <h1 className="text-4xl font-bold mb-6">About Me</h1>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-16">
                {/* Avatar and Social Media */}
                <div className="flex flex-col items-start">
                  <div className="w-[320px] h-[320px] bg-gray-200 rounded-full flex-shrink-0 mb-4"></div>
                  <div className="w-[320px] space-y-2">
                    <a
                      href="mailto:example@gmail.com"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">example@gmail.com</span>
                    </a>
                    <a
                      href="https://github.com/nguyen-van-anh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Github className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">nguyen-van-anh</span>
                    </a>
                    <a
                      href="https://linkedin.com/in/nguyen-van-anh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Linkedin className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">Nguyen Van Anh</span>
                    </a>
                    <a
                      href="https://facebook.com/nguyen-van-anh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <Facebook className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-black">Nguyen Van Anh</span>
                    </a>
                  </div>
                </div>
                {/* Information, Description, Skills, and Education */}
                <div className="flex-1">
                  <h2 className="text-4xl font-bold italic mb-1">Nguyễn Gia Bách</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    19 years old • Hanoi, Vietnam VN
                  </p>
                  <div className="mb-6">
                    <p className="text-base mb-3">
                      I’m a passionate AI and machine learning researcher with a focus on making complex technologies accessible to everyone. Currently pursuing my undergraduate degree in Computer Science, I’ve already contributed to several open-source projects and published research in the field of natural language processing.
                    </p>
                    <p className="text-base mb-3">
                      My journey in AI began when I was 16, experimenting with simple neural networks. Since then, I’ve developed a deep interest in reinforcement learning, computer vision, and the ethical implications of artificial intelligence.
                    </p>
                    <p className="text-base">
                      When I’m not coding or researching, you can find me playing chess, hiking in the beautiful landscapes around Hanoi, or volunteering at local tech education initiatives to inspire the next generation of AI enthusiasts.
                    </p>
                  </div>
                  <hr className="border-gray-200 mb-6" />
                  {/* Skills & Expertise */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-3">
                      {[
                        'Python',
                        'TensorFlow',
                        'PyTorch',
                        'Natural Language Processing',
                        'Computer Vision',
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
                  <hr className="border-gray-200 mb-6" />
                  {/* Education */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Education</h2>
                    <p className="text-base">
                      Bachelor of Science in Computer Science, Vietnam National University, Hanoi (2022 – Present)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* My Projects Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Projects</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-base">Coming soon</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}