import { useEffect, useState } from 'react';
import { useFooterAnimation } from '../context/FooterAnimationContext';

export default function Footer() {
  const { triggerFooterAnimation, setTriggerFooterAnimation } = useFooterAnimation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (triggerFooterAnimation) {
      setAnimate(true);
    }
  }, [triggerFooterAnimation]);

  useEffect(() => {
    if (animate) {
      const footerElement = document.querySelector('footer');
      if (footerElement) {
        const handleAnimationEnd = () => {
          setAnimate(false);
          setTriggerFooterAnimation(false);
        };
        footerElement.addEventListener('animationend', handleAnimationEnd);
        return () => {
          footerElement.removeEventListener('animationend', handleAnimationEnd);
        };
      }
    }
  }, [animate, setTriggerFooterAnimation]);

  return (
    <footer
      className={`bg-[#0a1128] text-white py-5.5 flex justify-center items-center w-full ${
        animate ? 'fade-out-down' : ''
      }`}
    >
      <div className="max-w-[1325px] w-full text-center">
        <p className="font-normal text-sm">
          © {new Date().getFullYear()} NgJaBach - All Rights Reserved | Made by{' '}
          <a
            href="https://github.com/hoanghero125"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-300 dek-font dek-hover-effects text-[22px] align-middle transition-all duration-300"
          >
            Dek
          </a>{' '}
          with 💖
        </p>
      </div>
    </footer>
  );
}