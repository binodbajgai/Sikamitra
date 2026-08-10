import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <span>Sikamitra</span>
        </div>

        {children}
      </section>
    </main>
  );
}