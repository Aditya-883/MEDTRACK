import './globals.css';
import WalletListener from './WalletListener';

export const metadata = {
  title: 'MedTrack',
  description: 'Healthcare DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <WalletListener />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
