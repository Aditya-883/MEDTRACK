import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WalletListener from './WalletListener';

export const metadata = {
  title: 'MedTrack',
  description: 'Healthcare DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen flex flex-col">

        {/* 🔥 GLOBAL WALLET LISTENER (KEEP AT TOP) */}
        <WalletListener />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <Footer />

      </body>
    </html>
  );
}