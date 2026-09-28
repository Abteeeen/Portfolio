import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-6 px-5 py-24 sm:px-8">
      <p className="label text-grey">404</p>
      <h1 className="display text-[clamp(36px,7vw,80px)] text-ink">
        That page is not <span className="hl-display">a system.</span>
      </h1>
      <p className="max-w-[50ch] text-[17px] text-grey">It does not exist here. The casework, method and contact are all on the front page.</p>
      <Link href="/" className="label w-fit border-b-2 border-mark text-ink">
        Back to the front page
      </Link>
    </main>
  );
}
