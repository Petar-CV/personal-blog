import type { CollectionEntry } from 'astro:content';

abstract class TagsUtils {
  /**
   * Returns an array of unique tags from an array of blog post entries.
   * @param posts An array of blog post entries.
   * @returns An array of unique tags.
   */
  public static getUniqueTagsFromPosts(
    posts: CollectionEntry<'blog'>[],
  ): string[] {
    const tags = posts.map((post) => post.data.tags ?? []).flat();
    const uniqueTags = [...new Set(tags)];
    return uniqueTags;
  }
}

export default TagsUtils;
