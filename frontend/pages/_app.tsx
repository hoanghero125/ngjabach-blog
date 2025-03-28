import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FooterAnimationProvider } from '../context/FooterAnimationContext';
import { AuthProvider } from '../context/AuthContext';
import { SearchProvider } from '../context/SearchContext';
import '../styles/globals.css';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <FooterAnimationProvider>
        <SearchProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-[#FAF9F6]">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </SearchProvider>
      </FooterAnimationProvider>
    </AuthProvider>
  );
}