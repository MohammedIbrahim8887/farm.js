import type { Metadata } from "@farm.js/core";
import { ArrowRight, ArrowUpRight, BookOpen, GitPullRequest } from "lucide-react";
import { ReleaseArtwork } from "../../components/blog/release-artwork";
import { launchPost } from "../../lib/blog";

export const metadata = {
  title: "Blog — Farm.js",
  description: "Releases, engineering notes, and ideas from the people building Farm.js.",
} satisfies Metadata;

export default function BlogPage() {
  return (
    <>
      <header className="blog-index-header">
        <div>
          <p className="blog-eyebrow">
            <span>05</span> / FROM THE FRAMEWORK
          </p>
          <h1>
            The Farm journal<span className="blog-title-period">.</span>
          </h1>
          <p className="blog-index-description">
            Releases, engineering notes, and ideas.
            <br />A closer look at what we’re building, and why.
          </p>
        </div>
        <a className="blog-text-link" href="https://github.com/farming-labs/farm.js/releases">
          Follow the releases <ArrowUpRight aria-hidden size={14} />
        </a>
      </header>

      <section className="blog-featured-section" aria-labelledby="latest-title">
        <div className="blog-section-rule">
          <h2 id="latest-title">Latest dispatch</h2>
          <span className="blog-eyebrow">001 / RELEASE NOTES</span>
        </div>
        <a className="blog-featured" href={launchPost.href} aria-labelledby="featured-title">
          <ReleaseArtwork />
          <div className="blog-featured-copy">
            <div className="blog-post-meta">
              <span className="blog-category">{launchPost.category}</span>
              <time dateTime={launchPost.dateTime}>{launchPost.date}</time>
            </div>
            <h3 id="featured-title">
              FarmJS 0.1
              <span>
                Stable. Integrated.
                <br />
                Agent-native.
              </span>
            </h3>
            <p>{launchPost.description}</p>
            <div className="blog-featured-bottom">
              <span className="blog-author">
                <span className="blog-author-avatar" aria-hidden>
                  KT
                </span>
                <span>
                  {launchPost.author}
                  <small>Creator of Farm.js</small>
                </span>
              </span>
              <span className="blog-read-link">
                Read the story <ArrowRight aria-hidden size={16} />
              </span>
            </div>
          </div>
        </a>
      </section>

      <section className="blog-explore" aria-labelledby="explore-title">
        <div className="blog-explore-intro">
          <p className="blog-eyebrow">KEEP EXPLORING</p>
          <h2 id="explore-title">Built in the open.</h2>
          <p>Follow the code. Build something with it.</p>
        </div>
        <a href="/docs/getting-started">
          <BookOpen aria-hidden size={19} />
          <span>
            Start building<small>Your first app, from the ground up.</small>
          </span>
          <ArrowUpRight aria-hidden size={17} />
        </a>
        <a href="https://github.com/farming-labs/farm.js">
          <GitPullRequest aria-hidden size={19} />
          <span>
            Follow development<small>The decisions, changes, and work ahead.</small>
          </span>
          <ArrowUpRight aria-hidden size={17} />
        </a>
      </section>
    </>
  );
}
