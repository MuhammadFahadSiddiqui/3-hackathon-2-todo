import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-[var(--primary-yellow)]/10 blur-3xl" />
        <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-[var(--secondary-purple)]/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-[var(--secondary-purple)]/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--muted)]">
              Hackathon Project 2026
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--foreground)]">Organize Your Life</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--primary-yellow)] via-[var(--primary-yellow-hover)] to-[var(--secondary-purple)] bg-clip-text text-transparent">
              One Task at a Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted)] sm:text-xl">
            A modern, intuitive todo application that helps you stay focused and
            accomplish more. Built with cutting-edge technology for a seamless
            experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary-yellow)] to-[var(--primary-yellow-hover)] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-[var(--primary-yellow)]/25 transition-all hover:shadow-2xl hover:shadow-[var(--primary-yellow)]/30 hover:scale-105"
            >
              Get Started Free
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] px-8 py-4 text-lg font-semibold text-[var(--foreground)] transition-all hover:border-[var(--secondary-purple)] hover:bg-[var(--secondary-purple)]/5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Why Choose TodoApp?
            </h2>
            <p className="text-[var(--muted)]">
              Everything you need to manage your tasks effectively
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-[var(--primary-yellow)]/5 hover:border-[var(--primary-yellow)]/30">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary-yellow)] to-[var(--primary-yellow-hover)] text-white shadow-lg shadow-[var(--primary-yellow)]/25">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">
                Lightning Fast
              </h3>
              <p className="text-[var(--muted)]">
                Built with Next.js and optimized for speed. Your tasks load
                instantly, every time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-[var(--secondary-purple)]/5 hover:border-[var(--secondary-purple)]/30">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] text-white shadow-lg shadow-[var(--secondary-purple)]/25">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">
                Secure by Design
              </h3>
              <p className="text-[var(--muted)]">
                Your data is protected with modern authentication and encrypted
                connections.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-[var(--success)]/5 hover:border-[var(--success)]/30">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--success)] to-emerald-600 text-white shadow-lg shadow-[var(--success)]/25">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">
                Simple & Intuitive
              </h3>
              <p className="text-[var(--muted)]">
                Clean interface designed for productivity. Focus on what
                matters: your tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card-bg)] to-[var(--secondary-purple)]/5 p-8 shadow-xl sm:p-12">
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Ready to Get Organized?
            </h2>
            <p className="mb-8 text-lg text-[var(--muted)]">
              Join now and start managing your tasks like a pro. It&apos;s free
              and takes less than a minute to sign up.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--secondary-purple)] to-[var(--secondary-purple-hover)] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-[var(--secondary-purple)]/25 transition-all hover:shadow-2xl hover:shadow-[var(--secondary-purple)]/30 hover:scale-105"
            >
              Create Your Account
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
