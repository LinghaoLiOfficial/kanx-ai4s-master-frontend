import Link from "next/link";

import { capabilities } from "@/config/capabilities";

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <div className="status-app">
    <header className="topbar"><div className="shell topbar-inner">
      <strong>kanx-ai4s-master</strong>
      <nav className="nav" aria-label="Primary navigation">
        <Link href="/">Status</Link>
        <Link href="/components">Components</Link>
        {capabilities.auth ? <Link href="/login">Sign in</Link> : null}
        {capabilities.auth ? <Link href="/dashboard">Account</Link> : null}
        {capabilities.storage ? <Link href="/files">Files</Link> : null}
      </nav>
    </div></header>
    <main className="shell main">{children}</main>
  </div>;
}
