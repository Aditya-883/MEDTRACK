import './globals.css';
import WalletListener from './WalletListener';

export const metadata = {
  title: 'MedTrack',
  description: 'Blockchain-secured Healthcare DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900">
        <WalletListener />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
