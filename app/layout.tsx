import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "./providers";

export const metadata: Metadata = {
  title: "Aruna - Agentic Business Intelligence",
  description: "AI-powered business intelligence platform with conversational analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}


