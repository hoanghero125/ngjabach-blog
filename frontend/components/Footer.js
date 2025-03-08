export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>
          © {new Date().getFullYear()} NgJaBach - All Rights Reserved | Made by{' '}
          <a
            href="https://www.facebook.com/dekuranvn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-300 font-bold italic hover:text-[#ed571b]"
            style={{
              transition: 'text-shadow 0.3s ease, color 0.3s ease', // Smooth transition
            }}
            onMouseEnter={(e) => {
              e.target.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 4px #ed571b';
            }}
            onMouseLeave={(e) => {
              e.target.style.textShadow = 'none';
            }}
          >
            Dek
          </a>{' '}
          with 💖
        </p>
      </footer>
    );
  }