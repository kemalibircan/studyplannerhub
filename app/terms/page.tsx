import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service",
  description: "StudyPlannerHub terms of service.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using StudyPlannerHub, you accept and agree to be bound by these Terms of Service.
              </p>
              <h2>Use of Service</h2>
              <p>
                StudyPlannerHub is provided free of charge for personal, non-commercial use. You may use our tools
                to plan your studies and organize your academic schedule.
              </p>
              <h2>No Warranty</h2>
              <p>
                StudyPlannerHub is provided &quot;as is&quot; without any warranties, expressed or implied. We do not guarantee
                that the service will be uninterrupted, error-free, or meet your specific requirements.
              </p>
              <h2>Limitation of Liability</h2>
              <p>
                StudyPlannerHub shall not be liable for any indirect, incidental, special, or consequential damages
                arising from your use of the service.
              </p>
              <h2>Data Responsibility</h2>
              <p>
                You are responsible for backing up your data. While we use localStorage to save your data locally,
                browser data can be cleared. We recommend exporting important timetables and study plans.
              </p>
              <h2>Modifications</h2>
              <p>
                We reserve the right to modify or discontinue the service at any time without notice.
              </p>
              <h2>Contact</h2>
              <p>
                If you have questions about these terms, please <a href="/contact">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

