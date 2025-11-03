import type { Metadata } from "next";
import "./globals.css";
import ConfigureAmplify from "./components/ConfigureAmplify";

export const metadata: Metadata = {
  title: "Todo App - AWS Amplify Gen 2",
  description: "A simple todo app built with AWS Amplify Gen 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
