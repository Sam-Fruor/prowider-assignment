import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Book My Packers - Lead System',
  description: 'Lead Distribution System Assignment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        
        <Toaster position="top-center" />
        <nav className="bg-blue-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white text-blue-800 font-bold p-1.5 rounded-md text-xl">
                  BMP
                </div>
                <span className="font-bold text-xl tracking-tight">Book My Packers</span>
                <span className="hidden md:inline ml-2 text-blue-200 text-sm">| Lead System</span>
              </div>
              <div className="flex space-x-4 text-sm font-medium">
                <Link href="/request-service" className="hover:text-blue-200 transition">Submit Lead</Link>
                <Link href="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                <Link href="/test-tools" className="hover:text-blue-200 transition">Test Panel</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>

        <footer className="bg-white border-t py-4 mt-auto">
          <div className="text-center text-sm text-gray-500">
            Full Stack Assignment Submission • Book My Packers
          </div>
        </footer>
      </body>
    </html>
  );
}