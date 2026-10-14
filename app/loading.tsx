export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />

        <p className="text-sm text-muted">
          Loading portfolio...
        </p>
      </div>
    </main>
  );
}
