import { person } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-6 sm:px-8">
        <span className="label text-grey">
          © {new Date().getFullYear()} {person.name}
        </span>
        <span className="label text-grey">No tracking scripts. Nothing you type here is stored.</span>
        <a href="#top" className="label text-ink">
          Top
        </a>
      </div>
    </footer>
  );
}
