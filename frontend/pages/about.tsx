export default function About() {
    return (
      <div className="bg-[#FAF9F6] min-h-screen">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">About Me</h1>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <h2 className="text-2xl font-semibold">Nguyen Van Anh</h2>
                <p className="text-gray-500">19 years old • Hanoi, Vietnam</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              I’m a passionate AI and machine learning researcher with a focus on making complex technologies accessible to everyone.
              Currently pursuing my undergraduate degree in Computer Science, I’ve already contributed to several open-source projects and published research in the field of natural language processing.
            </p>
            <p className="text-gray-700 mb-4">
              My journey in AI began when I was 16, experimenting with simple neural networks. Since then, I’ve developed a deep interest in reinforcement learning, computer vision, and the ethical implications of artificial intelligence.
            </p>
            <p className="text-gray-700 mb-4">
              When I’m not coding or researching, you can find me playing the chess, hiking in the beautiful landscapes around Hanoi, or volunteering at local tech initiatives to inspire the next generation of AI enthusiasts.
            </p>
            <div className="flex space-x-4 mb-4">
              <a href="mailto:example@gmail.com" className="text-blue-500 hover:underline">
                example@gmail.com
              </a>
              <a href="https://github.com" className="text-blue-500 hover:underline">
                GitHub
              </a>
              <a href="https://linkedin.com" className="text-blue-500 hover:underline">
                LinkedIn
              </a>
            </div>
            <h3 className="text-xl font-semibold mb-2">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Python', 'TensorFlow', 'PyTorch', 'Natural Language Processing', 'Computer Vision', 'Data Visualization', 'Research'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-semibold mb-2">Technical Writing</h3>
            <h3 className="text-xl font-semibold mb-2">Education</h3>
            <p className="text-gray-700 mb-4">
              Bachelor of Science in Computer Science<br />
              Vietnam National University, Hanoi (2022 - Present)
            </p>
            <h3 className="text-xl font-semibold mb-2">My Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold">Sentiment Analysis Tool</h4>
                <p className="text-gray-600 mb-2">
                  A Python-based tool that analyzes sentiment in Vietnamese text using a custom-trained BERT model.
                </p>
                <div className="flex space-x-2">
                  <a href="#" className="text-blue-500 hover:underline">View Project</a>
                  <a href="#" className="text-blue-500 hover:underline">GitHub</a>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold">AI Chess Companion</h4>
                <p className="text-gray-600 mb-2">
                  An interactive chess learning platform that uses reinforcement learning to adapt to the player’s skill level.
                </p>
                <div className="flex space-x-2">
                  <a href="#" className="text-blue-500 hover:underline">View Project</a>
                  <a href="#" className="text-blue-500 hover:underline">GitHub</a>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold">Medical Image Classifier</h4>
                <p className="text-gray-600 mb-2">
                  A computer vision project that helps identify abnormalities in X-ray images with high accuracy.
                </p>
                <div className="flex space-x-2">
                  <a href="#" className="text-blue-500 hover:underline">View Project</a>
                  <a href="#" className="text-blue-500 hover:underline">GitHub</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }