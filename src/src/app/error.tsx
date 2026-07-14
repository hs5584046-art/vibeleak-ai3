"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="glass max-w-lg rounded-3xl p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-black">The experience hit an unexpected error.</h1>
        <p className="mt-4 text-white/60">No payment or assessment action should be repeated until the page recovers.</p>
        <button onClick={reset} className="mt-7 rounded-2xl bg-white px-5 py-3 font-black text-black">
          Try again
        </button>
      </section>
    </main>
  );
}
