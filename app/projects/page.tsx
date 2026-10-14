import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-32 text-foreground">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← Back to home
        </Link>

        <p className="mt-12 text-sm uppercase tracking-[0.25em] text-accent">
          Portfolio
        </p>

        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
          Projects
        </h1>

        <p className="mt-6 max-w-2xl leading-7 text-muted">
          Practical software projects will be showcased here as they become
          ready to share.
        </p>
      </div>
    </main>
  );
}
