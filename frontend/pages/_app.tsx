import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FooterAnimationProvider } from '../context/FooterAnimationContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <FooterAnimationProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow bg-[#FAF9F6]">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </FooterAnimationProvider>
    </AuthProvider>
  );
}