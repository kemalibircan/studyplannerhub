import Link from "next/link";
import { Calendar, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Plan Your Studies,
              <br />
              <span className="text-primary">Ace Your Exams</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Free tools to build timetables, track exams, and generate study plans.
              All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/blog">Read Blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="/timetable" className="group">
              <div className="bg-card border border-border rounded-lg p-6 h-full transition-all hover:shadow-lg hover:border-primary/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Timetable Builder</h2>
                <p className="text-muted-foreground mb-4">
                  Create a weekly class schedule with drag-and-drop. Export as PDF, image, or shareable link.
                </p>
                <div className="flex items-center text-primary font-medium">
                  Try it <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/countdown" className="group">
              <div className="bg-card border border-border rounded-lg p-6 h-full transition-all hover:shadow-lg hover:border-primary/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Exam Countdown</h2>
                <p className="text-muted-foreground mb-4">
                  Track multiple exams with countdown timers. Get notifications and export to calendar.
                </p>
                <div className="flex items-center text-primary font-medium">
                  Try it <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/study-plan" className="group">
              <div className="bg-card border border-border rounded-lg p-6 h-full transition-all hover:shadow-lg hover:border-primary/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Study Plan Generator</h2>
                <p className="text-muted-foreground mb-4">
                  Generate a balanced weekly study schedule based on your subjects and availability.
                </p>
                <div className="flex items-center text-primary font-medium">
                  Try it <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Everything you need to plan your studies</h2>
            <p className="text-muted-foreground mb-6">
              All tools work offline, save automatically, and are completely free.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

