import { launchPost } from "../../lib/blog";

export function BlogAuthor() {
  return (
    <span className="blog-author">
      <img
        className="blog-author-avatar"
        src={launchPost.authorAvatar}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
      />
      <span>
        <span className="blog-author-name">{launchPost.author}</span>
        <small>Creator of Farm.js</small>
      </span>
    </span>
  );
}
