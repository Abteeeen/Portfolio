import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-faint sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Built with Next.js, Three.js, and Tailwind</span>
        <a href="#top" className="transition-colors hover:text-accent-2">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
