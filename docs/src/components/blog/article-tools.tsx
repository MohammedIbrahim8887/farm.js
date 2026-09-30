import { FileCode2, FileText } from "lucide-react";

export function ArticleTools({ href }: { href: string }) {
  return (
    <div className="blog-article-tools">
      <a href={`${href}.md`}>
        <FileText aria-hidden size={14} />
        Read Markdown
      </a>
      <a href={`https://github.com/farming-labs/farm.js/blob/main/docs/src/app${href}/page.md`}>
        <FileCode2 aria-hidden size={14} />
        View source
      </a>
    </div>
  );
}
