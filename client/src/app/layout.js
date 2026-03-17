import "./globals.css";
import Navbar from "../components/layout/Navbar";
import { Web3Provider } from "../context/Web3Context";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <Navbar />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}