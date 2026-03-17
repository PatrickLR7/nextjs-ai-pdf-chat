import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat with PDFs",
  description:
    "A Next.Js app built using Amazon Bedrock, Supabase, Drizzle ORM, and the AI SDK to chat with PDFs.",
  authors: {
    name: "PatrickLR7",
    url: "https://github.com/PatrickLR7",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
