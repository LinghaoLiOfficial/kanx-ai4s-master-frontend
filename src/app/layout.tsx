import type { Metadata } from "next";
import Link from "next/link";

import { capabilities } from "@/config/capabilities";
import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = { title: "kanx-ai4s-master" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="topbar">
            <div className="shell topbar-inner">
              <strong>kanx-ai4s-master</strong>
              <nav className="nav" aria-label="Primary navigation">
                <Link href="/">Status</Link>
                {capabilities.auth ? <Link href="/login">Sign in</Link> : null}
                {capabilities.auth ? <Link href="/dashboard">Account</Link> : null}
                {capabilities.storage ? <Link href="/files">Files</Link> : null}
              </nav>
            </div>
          </header>
          <main className="shell main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
