import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="VibeLytix home">
      <span className="logo-mark" aria-hidden="true">V</span>
      <span>VibeLytix</span>
    </Link>
  );
}
