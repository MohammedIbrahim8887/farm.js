import { Fragment, isValidElement, type ComponentPropsWithoutRef } from "react";
import { Check, Copy } from "lucide-react";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import typescript from "shiki/langs/typescript.mjs";
import vesper from "shiki/themes/vesper.mjs";

// Farm loads this map only on the server for source-authored Markdown routes.
// Load the blog's grammars once, with the same dark palette as the docs.
const highlighter = createHighlighterCoreSync({
  themes: [vesper],
  langs: [bash, typescript],
  engine: createJavaScriptRegexEngine(),
});
const languages = new Set(highlighter.getLoadedLanguages());

function Code({ children, className, ...props }: ComponentPropsWithoutRef<"code">) {
  const language = className?.match(/(?:^|\s)language-([^\s]+)/)?.[1];
  if (typeof children !== "string" || !language || !languages.has(language)) {
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }

  const lines = highlighter.codeToTokensBase(children, { lang: language, theme: "vesper" });
  return (
    <code {...props} className={className} data-highlighted="true">
      {lines.map((tokens, line) => (
        <Fragment key={line}>
          {line > 0 ? "\n" : null}
          {tokens.map((token, index) => (
            <span key={index} style={{ color: token.color }}>
              {token.content}
            </span>
          ))}
        </Fragment>
      ))}
    </code>
  );
}

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const language = isValidElement<{ className?: string }>(children)
    ? children.props.className?.match(/language-([^\s]+)/)?.[1]
    : undefined;
  const label =
    language === "bash" || language === "sh"
      ? "Terminal"
      : language === "ts" || language === "typescript"
        ? "TypeScript"
        : "Code";
  return (
    <div className="blog-code-block">
      <div className="blog-code-toolbar">
        <span>{label}</span>
        <button
          type="button"
          className="blog-code-copy"
          aria-label={`Copy ${label} code`}
          title={`Copy ${label} code`}
          hidden
        >
          <Copy className="blog-copy-icon" size={14} strokeWidth={1.5} aria-hidden />
          <Check className="blog-copy-check" size={14} strokeWidth={1.5} aria-hidden />
          <span data-copy-label>Copy</span>
        </button>
        <span className="sr-only" role="status" data-copy-status />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}

export const components = { code: Code, pre: Pre };
