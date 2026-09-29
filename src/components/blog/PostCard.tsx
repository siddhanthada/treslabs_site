import Link from "next/link";
import { Cover } from "./Cover";
import { fmtDate, type Post } from "@/content/posts";

export function PostMeta({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.15px] text-ink-3 ${className}`}>
      <span className="rounded-[6px] bg-sink px-2 py-0.5 text-ink-2">{post.category}</span>
      <span>{fmtDate(post.date)}</span>
      <span aria-hidden>·</span>
      <span>{post.minutes} min read</span>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <Cover
        src={post.cover.src}
        alt={post.cover.alt}
        cols={48}
        edge={0.34}
        sizes="(min-width: 1024px) 380px, 100vw"
        className="aspect-[16/10] rounded-[14.4px] ring-1 ring-ink/5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
      />
      <PostMeta post={post} className="mt-4" />
      <h3 className="mt-2.5 text-[19.8px] font-[540] leading-[1.18] tracking-[-0.02em] transition-colors group-hover:text-ink-2">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-[13.95px] leading-[1.5] text-ink-2">{post.dek}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13.05px] font-[520]">
        Read <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
