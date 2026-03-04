import { getPostBySlug, getRelatedPosts, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, BookOpen, Copy, Check } from "lucide-react";
import { Metadata } from "next";
import MarkdownContent from "@/components/blog/markdown-content";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: ["/logo.png"],
    },
    alternates: {
      canonical: post.canonical,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(params.slug, post.category, 2);

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <article>
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-4">
                  {post.category} • {post.readingTime} •{" "}
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                <p className="text-xl text-muted-foreground">{post.description}</p>
              </div>

              <div className="mb-12">
                <MarkdownContent content={post.content} />
              </div>

              <div className="border-t pt-8 mb-8">
                <p className="text-sm text-muted-foreground italic">
                  General information provided. Adapt to your school&apos;s requirements.
                </p>
              </div>
            </article>

            {/* Try Tools Card */}
            <Card className="mb-8 sticky top-20">
              <CardHeader>
                <CardTitle>Try Our Tools</CardTitle>
                <CardDescription>
                  Put these tips into practice with our free planning tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/timetable">
                      <Calendar className="w-4 h-4 mr-2" />
                      Timetable
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/countdown">
                      <Clock className="w-4 h-4 mr-2" />
                      Countdown
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/study-plan">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Study Plan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{relatedPost.title}</CardTitle>
                          <CardDescription>{relatedPost.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

