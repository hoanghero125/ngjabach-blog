import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-[#0a1128] text-white py-3.5 px-4">
      <div className="max-w-[1325px] mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NgJaBach
        </Link>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md bg-[#0a1128] border border-[#1a263f] text-gray-400 text-base focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <Link href="/" className="text-l font-normal text-gray-300 hover:text-white">
            Blog
          </Link>
          <Link href="/about" className="text-l font-normal text-gray-300 hover:text-white">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}