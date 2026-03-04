import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with StudyPlannerHub - questions, feedback, or support.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Have questions, feedback, or need help? We'd love to hear from you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Email</h3>
                    <p className="text-muted-foreground mb-2">
                      For any inquiries, questions, or feedback, please contact us at:
                    </p>
                    <a 
                      href="mailto:info@globaldijital.com" 
                      className="text-primary hover:underline font-medium text-lg"
                    >
                      info@globaldijital.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">General Inquiries</h3>
                    <p className="text-muted-foreground">
                      For general questions about StudyPlannerHub, please check our <a href="/blog" className="text-primary underline">blog</a> for guides and tips.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Feedback</h3>
                    <p className="text-muted-foreground">
                      We're always looking to improve. If you have suggestions for new features or improvements,
                      please reach out to us via email.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Technical Support</h3>
                    <p className="text-muted-foreground">
                      If you're experiencing technical issues, please check:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                      <li>Your browser is up to date</li>
                      <li>JavaScript is enabled</li>
                      <li>LocalStorage is available (check browser settings)</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      If the issue persists, please contact us at <a href="mailto:info@globaldijital.com" className="text-primary underline">info@globaldijital.com</a>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

