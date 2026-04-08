import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WalletListener from './WalletListener';
import Sidebar from '../components/layout/Sidebar';

export const metadata = {
  title: 'MedTrack',
  description: 'Healthcare DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">

        <WalletListener />

        {/* Sidebar */}
        <Sidebar />

        {/* Navbar */}
        <div className="fixed top-0 left-16 w-[calc(100%-4rem)] h-16 z-30">
          <Navbar />
        </div>

        {/* Content */}
        <div className="pt-20 ml-16 px-6 min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* ✅ FIXED FOOTER (same as navbar logic) */}
        <div className="ml-16 w-[calc(100%-4rem)]">
          <Footer />
        </div>

      </body>
    </html>
  );
}