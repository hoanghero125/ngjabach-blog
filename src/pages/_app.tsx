import type { AppProps } from 'next/app';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/styles/globals.css';
import 'katex/dist/katex.min.css';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <title>Nguyễn Gia Bách</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="flex min-h-screen flex-col bg-bg text-ink">
          <Navbar />
          <main className="relative flex flex-grow flex-col">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
