import Image from "next/image";

/** Editorial image: the real photo, as is. */
export function Cover({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Kept for call-site compatibility; unused. */
  cols?: number;
  edge?: number;
}) {
  return (
    <div className={`relative overflow-hidden bg-sink ${className}`}>
      <Image src={`${src}?w=1600&q=80&auto=format`} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
    </div>
  );
}
