import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CTA } from "@/components/home/CTA";
import { Cover } from "@/components/blog/Cover";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { Avatar } from "@/components/blog/BlogIndex";
import { CopyLink, ReadingProgress, Toc } from "@/components/blog/ArticleChrome";
import { Mark } from "@/components/brand/Mark";
import { Button } from "@/components/site/Button";
import { bySlug, posts, type Block } from "@/content/posts";
import { links } from "@/content/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = bySlug(slug);
  return post ? { title: `${post.title} — Treslabs`, description: post.dek } : {};
}

export default async function Article({ params }: Params) {
  const { slug } = await params;
  const post = bySlug(slug);
  if (!post) notFound();
  const toc = post.body.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2").map((b) => ({ id: b.id, text: b.text }));
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <Nav />
      <ReadingProgress />
      <main className="pt-[var(--nav-h)]">
        <article>
          <header className="wrap pt-14 md:pt-20">
            <div className="mx-auto max-w-[820px] text-center">
              <nav className="flex items-center justify-center gap-2 text-[12.6px] text-ink-3" aria-label="Breadcrumb">
                <Link href="/blog" className="transition-colors hover:text-ink">
                  Writing
                </Link>
                <span aria-hidden>/</span>
                <span className="text-ink-2">{post.category}</span>
              </nav>
              <h1 className="mt-6 text-[clamp(36px,5vw,66px)] font-[560] leading-[1.02] tracking-[-0.042em] text-balance">{post.title}</h1>
              <p className="mx-auto mt-6 max-w-[40rem] text-[17.1px] leading-[1.5] text-ink-2 text-pretty">{post.dek}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-3 text-left">
                  <Avatar name={post.author.name} />
                  <div className="text-[12.6px]">
                    <div className="font-[540]">{post.author.name}</div>
                    <div className="text-ink-3">{post.author.role}</div>
                  </div>
                </div>
                <PostMeta post={post} />
              </div>
            </div>
            <Cover
              src={post.cover.src}
              alt={post.cover.alt}
              priority
              cols={96}
              edge={0.26}
              sizes="100vw"
              className="mt-12 aspect-[16/9] rounded-[18px] ring-1 ring-ink/5 md:mt-16 md:aspect-[21/9]"
            />
          </header>

          <div className="wrap mt-14 grid gap-10 md:mt-20 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <Toc items={toc} />
            </aside>
            <div className="min-w-0 lg:col-span-7">
              <div className="article">{post.body.map((b, i) => <BlockView key={i} b={b} />)}</div>

              <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author.name} />
                  <div className="text-[12.6px]">
                    <div className="font-[540]">Written by {post.author.name}</div>
                    <div className="text-ink-3">{post.author.role} · Treslabs</div>
                  </div>
                </div>
                <CopyLink />
              </div>

              {/* invitation */}
              <div className="mt-12 flex flex-col gap-6 rounded-[18px] bg-ink p-8 text-bone md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <Mark centered className="mt-1 h-7 w-7 shrink-0 text-lime" trail={false} title="" />
                  <div>
                    <div className="text-[19.8px] font-[540] tracking-[-0.02em]">Shape Treslabs before launch.</div>
                    <p className="mt-1.5 text-[13.5px] leading-[1.5] text-on-carbon-2">We’re onboarding a few design partners. Send us one call to start.</p>
                  </div>
                </div>
                <Button href={links.partner} variant="lime" arrow>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </article>

        <section className="wrap mt-28 pb-28 md:pb-36">
          <div className="flex items-end justify-between border-b border-line pb-5">
            <h2 className="text-[clamp(24px,2.4vw,32px)] font-[540] tracking-[-0.028em]">Keep reading</h2>
            <Link href="/blog" className="text-[13.5px] text-ink-2 transition-colors hover:text-ink">
              All writing →
            </Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </main>
      <div className="flex flex-col bg-carbon">
        <CTA />
        <Footer />
      </div>
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "p":
      return <p>{b.text}</p>;
    case "h2":
      return (
        <h2 id={b.id} className="scroll-mt-[calc(var(--nav-h)+24px)]">
          {b.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote>
          <p>{b.text}</p>
          {b.by && <cite>{b.by}</cite>}
        </blockquote>
      );
    case "callout":
      return (
        <div className="callout">
          <div className="callout-title">{b.title}</div>
          <p>{b.text}</p>
        </div>
      );
    case "stats":
      return (
        <div className="stats">
          {b.items.map((s) => (
            <div key={s.k}>
              <div className="stat-v">{s.v}</div>
              <div className="stat-k">{s.k}</div>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <ul className="list">
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "transcript":
      return (
        <div className="transcript" role="group" aria-label="Call transcript">
          {b.lines.map((l, i) => (
            <div key={i} className={`line line-${l.who}`}>
              <span className="who">{l.who === "caller" ? "Caller" : l.who === "agent" ? "Agent" : "System"}</span>
              <span className="what">{l.who === "caller" ? `“${l.text}”` : l.text}</span>
            </div>
          ))}
        </div>
      );
  }
}
