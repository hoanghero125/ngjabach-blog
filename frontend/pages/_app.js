import '../styles/globals.css';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}