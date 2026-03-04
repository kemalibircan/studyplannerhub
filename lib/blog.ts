import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  content: string;
  canonical: string;
}

const postsDirectory = path.join(process.cwd(), "content/blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((name) => name.endsWith(".md") && !name.startsWith("_"));
  const allPostsData = fileNames.map((fileName) => {
    try {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      // Validate required fields
      if (!data.title || !data.description || !data.date || !data.category) {
        console.warn(`Skipping ${fileName} - missing required frontmatter fields`);
        return null;
      }

      return {
        slug: fileName.replace(/\.md$/, ""),
        title: data.title || "",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        category: data.category || "Uncategorized",
        readingTime: stats.text,
        content,
        canonical: data.canonical || `https://studyplannerhub.com/blog/${fileName.replace(/\.md$/, "")}`,
      } as BlogPost;
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
      return null;
    }
  }).filter((post): post is BlogPost => post !== null);

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    // Validate required fields
    if (!data.title || !data.description || !data.date || !data.category) {
      console.warn(`Post ${slug} is missing required frontmatter fields`);
      return null;
    }

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || new Date().toISOString(),
      category: data.category || "Uncategorized",
      readingTime: stats.text,
      content,
      canonical: data.canonical || `https://studyplannerhub.com/blog/${slug}`,
    } as BlogPost;
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(currentSlug: string, category: string, limit: number = 2): BlogPost[] {
  return getAllPosts()
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}

