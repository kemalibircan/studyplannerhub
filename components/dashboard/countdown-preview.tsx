"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadFromStorage } from "@/lib/storage";
import { Exam } from "@/types/countdown";

export default function CountdownPreview() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const savedExams = loadFromStorage<Exam[]>("countdown-exams", []);
    setExams(savedExams);
  }, []);

  function getTimeRemaining(exam: Exam): { days: number; hours: number; minutes: number; isPast: boolean } {
    const examDate = new Date(exam.date);
    if (exam.time) {
      const [hours, minutes] = exam.time.split(":").map(Number);
      examDate.setHours(hours, minutes, 0, 0);
    } else {
      examDate.setHours(9, 0, 0, 0);
    }

    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isPast };
  }

  const sortedExams = [...exams]
    .filter((exam) => !getTimeRemaining(exam).isPast)
    .sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? `T${a.time}` : "T09:00"));
      const dateB = new Date(b.date + (b.time ? `T${b.time}` : "T09:00"));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group h-full" onClick={() => window.location.href = "/countdown"}>
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Exam Countdown</CardTitle>
        <CardDescription>
          Track your upcoming exams with countdown timers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mini Countdown Preview */}
        {exams.length === 0 ? (
          <div className="mb-4 text-center py-6 text-muted-foreground text-sm">
            No exams added yet
          </div>
        ) : sortedExams.length === 0 ? (
          <div className="mb-4 text-center py-6 text-muted-foreground text-sm">
            All exams have passed
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            {sortedExams.map((exam) => {
              const timeRemaining = getTimeRemaining(exam);
              return (
                <div
                  key={exam.id}
                  className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{exam.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div
                      className={`w-1 h-8 rounded ${priorityColors[exam.priority]}`}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-lg font-bold">{timeRemaining.days}</div>
                      <div className="text-muted-foreground">days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{timeRemaining.hours}</div>
                      <div className="text-muted-foreground">hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{timeRemaining.minutes}</div>
                      <div className="text-muted-foreground">min</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{exams.length} {exams.length === 1 ? "exam" : "exams"} total</span>
          {sortedExams.length > 0 && (
            <span className="text-xs">
              {sortedExams.length} upcoming
            </span>
          )}
        </div>

        <Button asChild className="w-full group-hover:bg-primary/90">
          <Link href="/countdown">
            Open Countdown <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

