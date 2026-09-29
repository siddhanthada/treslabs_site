import Link from "next/link";
import { Section } from "@/components/site/Section";
import { Cover } from "@/components/blog/Cover";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { posts } from "@/content/posts";

/* The thinking behind the product: the manifesto, and the latest notes. */
export function Writing() {
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p !== featured).slice(0, 2);
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="What we believe, written down."
      sub="The thinking behind Treslabs — and what we learn from every test call."
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
        <Link href={`/blog/${featured.slug}`} className="group lg:col-span-6">
          <Cover
            src={featured.cover.src}
            alt={featured.cover.alt}
            cols={64}
            sizes="(min-width: 1024px) 600px, 100vw"
            className="aspect-[16/11] rounded-[14.4px] ring-1 ring-ink/5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
          />
          <PostMeta post={featured} className="mt-5" />
          <h3 className="mt-3 text-[clamp(24px,2.3vw,32.4px)] font-[540] leading-[1.1] tracking-[-0.028em]">{featured.title}</h3>
          <p className="mt-3 max-w-[46ch] text-[15.3px] leading-[1.5] text-ink-2">{featured.dek}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-[520]">
            Read the manifesto <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6">
          {rest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
      <div className="mt-12 flex justify-center">
        <Link href="/blog" className="btn btn-line">
          All writing <span className="arrow" aria-hidden>→</span>
        </Link>
      </div>
    </Section>
  );
}
