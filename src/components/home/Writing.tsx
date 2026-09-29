import Link from "next/link";
import { Section } from "@/components/site/Section";
import { PostCard } from "@/components/blog/PostCard";
import { posts } from "@/content/posts";

/* The thinking behind the product: the manifesto first, then the latest notes. */
export function Writing() {
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const three = [featured, ...posts.filter((p) => p !== featured)].slice(0, 3);
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="What we believe, written down."
      sub="The thinking behind Treslabs — and what we learn from every test call."
      align="left"
    >
      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {three.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      <div className="mt-14 flex justify-center">
        <Link href="/blog" className="btn btn-line">
          All writing <span className="arrow" aria-hidden>→</span>
        </Link>
      </div>
    </Section>
  );
}
