"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary-yellow)] to-[var(--secondary-purple)]">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <span className="hidden text-xl font-bold sm:inline-block">
            <span className="text-[var(--primary-yellow)]">Todo</span>
            <span className="text-[var(--secondary-purple)]">App</span>
          </span>
        </Link>

        {/* Author Name - Center */}
        <div className="hidden md:flex items-center">
          <span className="text-sm font-medium text-[var(--muted)]">
            Built by{" "}
            <span className="font-semibold text-[var(--foreground)]">
              Muhammad Fahad Siddiqui
            </span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-[var(--card-border)]" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/tasks"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-border)]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                My Tasks
              </Link>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--card-border)] px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--secondary-purple)] text-xs font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate text-sm text-[var(--muted)]">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--error)] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-border)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-[var(--primary-yellow)] to-[var(--primary-yellow-hover)] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[var(--primary-yellow)]/25 transition-all hover:shadow-xl hover:shadow-[var(--primary-yellow)]/30 hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
