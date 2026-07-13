import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="glass max-w-lg rounded-3xl p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">404</p>
        <h1 className="mt-3 text-4xl font-black">This page does not exist.</h1>
        <Link href="/" className="mt-7 inline-flex rounded-2xl bg-white px-5 py-3 font-black text-black">
          Return home
        </Link>
      </section>
    </main>
  );
}
