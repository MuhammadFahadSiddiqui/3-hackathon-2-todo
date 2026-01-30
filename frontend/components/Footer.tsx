"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--card-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-center text-sm text-[var(--muted)]">
            &copy; {currentYear} All Rights Reserved &mdash;{" "}
            <span className="font-semibold text-[var(--foreground)]">
              Muhammad Fahad Siddiqui
            </span>
          </p>

          {/* Tech Stack */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted-light)]">Built with</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--card-border)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                Next.js
              </span>
              <span className="rounded-full bg-[var(--card-border)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                Tailwind
              </span>
              <span className="rounded-full bg-[var(--card-border)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                FastAPI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
