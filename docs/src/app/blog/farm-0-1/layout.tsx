import type { LayoutProps } from "@farm.js/core";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ArticleTools } from "../../../components/blog/article-tools";
import { ReleaseArtwork } from "../../../components/blog/release-artwork";
import { launchPost, launchSections } from "../../../lib/blog";

function Contents() {
  return (
    <nav aria-label="On this page" className="blog-contents-links">
      {launchSections.map(([id, label], index) => (
        <a key={id} href={`#${id}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {label}
        </a>
      ))}
    </nav>
  );
}

export default function LaunchPostLayout({ children }: LayoutProps) {
  return (
    <>
      <div className="blog-breadcrumb">
        <a href="/blog">
          <ArrowLeft aria-hidden size={14} />
          All posts
        </a>
        <span className="blog-eyebrow">RELEASE NOTES / 001</span>
      </div>
      <header className="blog-post-header">
        <div className="blog-post-heading">
          <div className="blog-post-meta">
            <span className="blog-category">{launchPost.category}</span>
            <time dateTime={launchPost.dateTime}>{launchPost.date}</time>
          </div>
          <h1>
            FarmJS 0.1:
            <br />
            Stable, Integrated,
            <br />
            <span>and Agent-Native.</span>
          </h1>
          <p>{launchPost.description}</p>
          <div className="blog-post-byline">
            <span className="blog-author">
              <span className="blog-author-avatar" aria-hidden>
                KT
              </span>
              <span>
                {launchPost.author}
                <small>Creator of Farm.js</small>
              </span>
            </span>
          </div>
        </div>
        <ReleaseArtwork compact />
      </header>
      <div className="blog-reading-grid">
        <aside className="blog-contents">
          <div className="blog-contents-sticky">
            <p className="blog-eyebrow">IN THIS ARTICLE</p>
            <Contents />
            <ArticleTools href={launchPost.href} />
          </div>
        </aside>
        <div className="blog-reading-column">
          <details className="blog-mobile-contents">
            <summary>
              In this article <span>{launchSections.length} sections</span>
            </summary>
            <Contents />
          </details>
          <div className="blog-prose">{children}</div>
          <div className="blog-article-end">
            <span aria-hidden className="blog-end-mark">
              ▦
            </span>
            <p>Thanks for building with us.</p>
            <a href="https://github.com/farming-labs/farm.js">
              Join us on GitHub <ArrowUpRight aria-hidden size={15} />
            </a>
          </div>
          <div className="blog-mobile-tools">
            <ArticleTools href={launchPost.href} />
          </div>
        </div>
      </div>
      <div className="blog-next-step">
        <div>
          <span className="blog-eyebrow">YOUR NEXT COMMIT</span>
          <h2>Make something with Farm.</h2>
        </div>
        <a href="/docs/getting-started">
          Start building <ArrowRight aria-hidden size={16} />
        </a>
      </div>
    </>
  );
}
