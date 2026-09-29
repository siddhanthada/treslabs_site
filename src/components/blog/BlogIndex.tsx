"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Cover } from "./Cover";
import { PostCard, PostMeta } from "./PostCard";
import { categories, posts } from "@/content/posts";
import { links } from "@/content/site";
import { Draft } from "@/components/site/Draft";
import { ease } from "@/lib/motion";

export function BlogIndex() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const list = posts.filter((p) => p !== featured && (cat === "All" || p.category === cat));
  const showFeatured = cat === "All" || featured.category === cat;

  return (
    <>
      {/* featured */}
      {showFeatured && (
        <Link href={`/blog/${featured.slug}`} className="group mt-14 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <Cover
            src={featured.cover.src}
            alt={featured.cover.alt}
            priority
            cols={80}
            edge={0.28}
            sizes="(min-width: 1024px) 720px, 100vw"
            className="aspect-[16/10] rounded-[18px] ring-1 ring-ink/5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 lg:col-span-7"
          />
          <div className="lg:col-span-5">
            <div className="t-label text-lime-deep">Featured</div>
            <PostMeta post={featured} className="mt-3" />
            <h2 className="mt-4 text-[clamp(28px,3vw,42px)] font-[540] leading-[1.06] tracking-[-0.032em]">{featured.title}</h2>
            <p className="mt-4 text-[15.3px] leading-[1.55] text-ink-2">{featured.dek}</p>
            <div className="mt-6 flex items-center gap-3">
              <Avatar name={featured.author.name} />
              <div className="text-[12.6px]">
                <div className="font-[540]">{featured.author.name}</div>
                <div className="text-ink-3">{featured.author.role}</div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* filter */}
      <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`rounded-[9px] px-3.5 py-1.5 text-[12.6px] transition-colors ${
                cat === c ? "bg-ink text-bone" : "bg-sink text-ink-2 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="t-label text-ink-3">{list.length + (showFeatured && cat !== "All" ? 1 : 0)} posts</span>
      </div>

      {/* posts */}
      <motion.div layout className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: ease.out }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && !showFeatured && <p className="mt-10 text-[14.4px] text-ink-2">No posts in {cat} yet.</p>}

      {/* subscribe */}
      <div className="mt-24 grid items-center gap-6 rounded-[18px] border border-line bg-paper p-8 md:grid-cols-12 md:p-10">
        <div className="md:col-span-7">
          <h2 className="text-[clamp(22px,2.2vw,30px)] font-[540] leading-[1.12] tracking-[-0.025em]">
            New writing, when there’s something worth saying.
          </h2>
          <p className="mt-2 text-[14.4px] text-ink-2">About one email a month. No launch spam. <Draft /></p>
        </div>
        <form
          className="flex gap-2 md:col-span-5"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = links.newsletter;
          }}
        >
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-[41.4px] min-w-0 flex-1 rounded-[10px] border border-[#8a8c84] bg-bone px-3.5 text-[13.5px] outline-none placeholder:text-ink-3 focus:border-ink"
          />
          <button type="submit" className="btn btn-lime">
            Subscribe
          </button>
        </form>
      </div>
    </>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[12.6px] font-[540] text-lime" aria-hidden>
      {name.replace(/^The /, "").charAt(0)}
    </span>
  );
}
