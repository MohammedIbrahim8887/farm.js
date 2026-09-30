import type { LayoutProps } from "@farm.js/core";
import "./blog.css";

export default function BlogLayout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6 sm:py-16">
      <nav className="mb-10 flex items-center gap-3 font-mono text-xs uppercase text-white/50">
        <a className="hover:text-white" href="/">
          Farm.js
        </a>
        <span aria-hidden>/</span>
        <a className="hover:text-white" href="/blog">
          Blog
        </a>
      </nav>
      <article className="farm-blog">{children}</article>
    </div>
  );
}
