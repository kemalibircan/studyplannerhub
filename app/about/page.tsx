import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "About StudyPlannerHub",
  description: "Learn about StudyPlannerHub - free tools to help students plan their studies and ace their exams.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">About StudyPlannerHub</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                StudyPlannerHub is a free, comprehensive platform designed to help students plan their studies effectively.
                We provide tools for creating timetables, tracking exams, and generating study plans—all in one place.
              </p>
              <h2>Our Mission</h2>
              <p>
                We believe that effective planning is the foundation of academic success. Our mission is to provide
                students with free, easy-to-use tools that help them organize their studies and reduce stress.
              </p>
              <h2>Features</h2>
              <ul>
                <li><strong>Timetable Builder:</strong> Create and manage your weekly class schedule</li>
                <li><strong>Exam Countdown:</strong> Track upcoming exams with countdown timers</li>
                <li><strong>Study Plan Generator:</strong> Generate balanced weekly study schedules</li>
                <li><strong>Blog:</strong> Tips, guides, and templates for effective study planning</li>
              </ul>
              <h2>Privacy & Data</h2>
              <p>
                All data is stored locally in your browser. We don't collect, store, or share any personal information.
                Your timetables, exams, and study plans remain private and secure on your device.
              </p>
              <h2>Contact</h2>
              <p>
                Have questions or feedback? Visit our <a href="/contact">contact page</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

