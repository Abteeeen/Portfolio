import { nav, person } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
        <a href="#top" className="label text-ink">
          {person.name}
        </a>
        <nav aria-label="Sections" className="order-3 flex w-full gap-x-5 gap-y-1 sm:order-none sm:w-auto">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="label text-grey transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${person.email}`}
            className="label hidden border-b-2 border-mark text-ink md:inline"
          >
            {person.email}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
