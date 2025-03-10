export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>
        © {new Date().getFullYear()} NgJaBach - All Rights Reserved | Made by{' '}
        <a
          href="https://www.facebook.com/dekuranvn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-300 dek-font dek-hover-effects text-[22px] align-middle transition-all duration-300"
        >
          Dek
        </a>{' '}
        with 💖
      </p>
    </footer>
  );
}