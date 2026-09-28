import Image from "next/image";
import type { Device as Kind } from "@/content/film";

/** A device frame with either a real screenshot or a marked placeholder. */
export function Device({ kind, src, alt, spec, label }: { kind: Kind; src?: string; alt: string; spec: string; label: string }) {
  return (
    <div className={`device device-${kind}`}>
      <div className="screenwrap">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 90vw" className="object-cover object-top" />
        ) : (
          <div className="placeholder" role="img" aria-label={`Placeholder: ${spec}`}>
            <b>{label}</b>
            <span>{spec}</span>
          </div>
        )}
      </div>
    </div>
  );
}
