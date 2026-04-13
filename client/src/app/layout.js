import './globals.css';

export const metadata = {
  title: 'MedTrack',
  description: 'Healthcare DApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
