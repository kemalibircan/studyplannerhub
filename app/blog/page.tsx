import { getAllPosts } from "@/lib/blog";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BlogClient from "@/components/blog/blog-client";

export const metadata = {
  title: "Blog - Study Planning Tips & Guides",
  description: "Learn how to plan your studies effectively with our guides on timetables, exam preparation, and study schedules.",
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const categories = Array.from(new Set(allPosts.map((p) => p.category)));

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Planning Blog</h1>
            <p className="text-muted-foreground mb-8">
              Tips, guides, and templates to help you plan your studies effectively
            </p>

            <BlogClient posts={allPosts} categories={categories} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

