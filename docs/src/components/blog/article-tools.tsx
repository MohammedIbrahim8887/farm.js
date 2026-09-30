import { ArrowDownRight, ArrowUpRight, FileCode2, FileText } from "lucide-react";

export function ArticleTools({ href }: { href: string }) {
  return (
    <div className="blog-article-tools" role="group" aria-label="Article resources">
      <a href={`${href}.md`}>
        <FileText aria-hidden size={14} />
        <span>Read Markdown</span>
        <ArrowDownRight aria-hidden size={12} className="blog-tool-arrow" />
      </a>
      <a href={`https://github.com/farming-labs/farm.js/blob/main/docs/src/app${href}/page.md`}>
        <FileCode2 aria-hidden size={14} />
        <span>View source</span>
        <ArrowUpRight aria-hidden size={12} className="blog-tool-arrow" />
      </a>
    </div>
  );
}
