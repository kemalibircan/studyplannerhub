import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy",
  description: "StudyPlannerHub privacy policy - we don't collect or store your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              <h2>Data Collection</h2>
              <p>
                StudyPlannerHub does not collect, store, or transmit any personal information. All data you create
                (timetables, exams, study plans) is stored locally in your browser using localStorage.
              </p>
              <h2>Local Storage</h2>
              <p>
                We use browser localStorage to save your data locally on your device. This data never leaves your computer
                and is not accessible to us or any third parties.
              </p>
              <h2>Cookies</h2>
              <p>
                We may use cookies to store your theme preference (dark/light mode). These cookies are stored locally
                and do not contain personal information.
              </p>
              <h2>Third-Party Services</h2>
              <p>
                If you choose to export your data (PDF, images, calendar files), these are generated client-side and
                do not involve sending data to any server.
              </p>
              <h2>Your Rights</h2>
              <p>
                Since we don't collect any data, there's no data to access, modify, or delete. You can clear your
                browser's localStorage at any time to remove all your data.
              </p>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will be posted on this page.
              </p>
              <h2>Contact</h2>
              <p>
                If you have questions about this privacy policy, please <a href="/contact">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

