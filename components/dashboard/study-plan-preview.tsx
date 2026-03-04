"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadFromStorage } from "@/lib/storage";
import { StudyPlanState } from "@/types/study-plan";
import { timeToMinutes } from "@/lib/utils";

export default function StudyPlanPreview() {
  const [state, setState] = useState<StudyPlanState | null>(null);

  useEffect(() => {
    const saved = loadFromStorage<StudyPlanState | null>("study-plan-state", null);
    setState(saved);
  }, []);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const subjects = state?.subjects || [];
  const sessions = state?.sessions || [];

  // Get sessions for preview (first 5 days, limited sessions)
  const previewSessions = sessions
    .filter((s) => s.day < 5)
    .slice(0, 8)
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Unknown";
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group h-full" onClick={() => window.location.href = "/study-plan"}>
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Study Plan Generator</CardTitle>
        <CardDescription>
          Generate a balanced weekly study schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mini Study Plan Preview */}
        {subjects.length === 0 ? (
          <div className="mb-4 text-center py-6 text-muted-foreground text-sm">
            No subjects added yet
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            {/* Subjects List */}
            <div className="flex flex-wrap gap-2 mb-3">
              {subjects.slice(0, 4).map((subject) => {
                const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);
                const totalHours = subjectSessions.reduce((sum, s) => {
                  const start = timeToMinutes(s.startTime);
                  const end = timeToMinutes(s.endTime);
                  return sum + (end - start) / 60;
                }, 0);
                return (
                  <div
                    key={subject.id}
                    className="text-xs bg-muted/50 px-2 py-1 rounded border"
                  >
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-muted-foreground">
                      {totalHours.toFixed(1)}h / {subject.desiredHoursPerWeek}h
                    </div>
                  </div>
                );
              })}
              {subjects.length > 4 && (
                <div className="text-xs bg-muted/50 px-2 py-1 rounded border text-muted-foreground">
                  +{subjects.length - 4} more
                </div>
              )}
            </div>

            {/* Mini Schedule Grid */}
            {sessions.length > 0 && (
              <div className="border rounded-lg p-2 bg-card">
                <div className="grid grid-cols-5 gap-1 text-[9px]">
                  {dayNames.map((day, dayIdx) => {
                    const daySessions = previewSessions.filter((s) => s.day === dayIdx);
                    return (
                      <div key={day} className="text-center">
                        <div className="font-semibold mb-1 text-[10px]">{day}</div>
                        <div className="space-y-0.5">
                          {daySessions.length > 0 ? (
                            daySessions.slice(0, 2).map((session) => {
                              const subject = getSubjectName(session.subjectId);
                              return (
                                <div
                                  key={session.id}
                                  className="bg-primary/20 text-primary rounded px-1 py-0.5 truncate"
                                  title={`${subject} ${session.startTime}-${session.endTime}`}
                                >
                                  {subject.substring(0, 6)}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-muted-foreground/50 text-[8px]">-</div>
                          )}
                          {daySessions.length > 2 && (
                            <div className="text-[8px] text-muted-foreground">
                              +{daySessions.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </span>
          {sessions.length > 0 && (
            <span className="text-xs">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
            </span>
          )}
        </div>

        <Button asChild className="w-full group-hover:bg-primary/90">
          <Link href="/study-plan">
            Open Generator <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

