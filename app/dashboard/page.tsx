"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TimetablePreview from "@/components/dashboard/timetable-preview";
import CountdownPreview from "@/components/dashboard/countdown-preview";
import StudyPlanPreview from "@/components/dashboard/study-plan-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Manage your timetables, track exams, and generate study plans.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <TimetablePreview />
              <CountdownPreview />
              <StudyPlanPreview />
            </div>

            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All data is saved automatically in your browser</li>
                    <li>• You can export timetables as PDF or images</li>
                    <li>• Exam countdowns can be added to your calendar</li>
                    <li>• Study plans adapt to your availability and preferences</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

