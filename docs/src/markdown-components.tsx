import { Fragment, type ComponentPropsWithoutRef } from "react";
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

export const components = { code: Code };
