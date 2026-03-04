"use client";

import { useState, useEffect } from "react";
import { Subject, Availability, Constraints, StudySession, StudyPlanState } from "@/types/study-plan";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { generateId, timeToMinutes, minutesToTime } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, RefreshCw, Lock, Unlock, Calendar, Share2, Printer, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createEvents } from "ics";

const DEFAULT_AVAILABILITY: Availability = {
  days: [true, true, true, true, true, false, false],
  timeBlocks: [{ start: "09:00", end: "17:00" }],
  breakDuration: 10,
  breakInterval: 50,
};

const DEFAULT_CONSTRAINTS: Constraints = {
  maxSessionsPerDay: 4,
  avoidLateHours: true,
  lateHourThreshold: "20:00",
};

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlanPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    difficulty: 3,
    desiredHoursPerWeek: 5,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage<StudyPlanState>("study-plan-state", {
      subjects: [],
      availability: DEFAULT_AVAILABILITY,
      constraints: DEFAULT_CONSTRAINTS,
      sessions: [],
    });
    
    if (saved) {
      if (saved.subjects && saved.subjects.length >= 0) {
        setSubjects(saved.subjects);
      }
      if (saved.availability) {
        setAvailability(saved.availability);
      }
      if (saved.constraints) {
        setConstraints(saved.constraints);
      }
      if (saved.sessions && saved.sessions.length >= 0) {
        setSessions(saved.sessions);
      }
    }
  }, []);

  function handleAddSubject() {
    if (!subjectFormData.name) {
      toast({
        title: "Missing name",
        description: "Please enter a subject name.",
        variant: "destructive",
      });
      return;
    }

    const newSubject: Subject = {
      id: editingSubject?.id || generateId(),
      ...subjectFormData,
    };

    let updatedSubjects: Subject[];
    if (editingSubject) {
      updatedSubjects = subjects.map((s) => (s.id === editingSubject.id ? newSubject : s));
      setSubjects(updatedSubjects);
      saveToStorage("study-plan-state", {
        subjects: updatedSubjects,
        availability,
        constraints,
        sessions,
      });
      toast({ title: "Subject updated", description: `${newSubject.name} has been updated.` });
    } else {
      updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      saveToStorage("study-plan-state", {
        subjects: updatedSubjects,
        availability,
        constraints,
        sessions,
      });
      toast({ title: "Subject added", description: `${newSubject.name} has been added.` });
    }

    setIsSubjectDialogOpen(false);
    setEditingSubject(null);
    setSubjectFormData({ name: "", difficulty: 3, desiredHoursPerWeek: 5 });
  }

  function handleDeleteSubject(subject: Subject) {
    const updatedSubjects = subjects.filter((s) => s.id !== subject.id);
    const updatedSessions = sessions.filter((s) => s.subjectId !== subject.id);
    setSubjects(updatedSubjects);
    setSessions(updatedSessions);
    saveToStorage("study-plan-state", {
      subjects: updatedSubjects,
      availability,
      constraints,
      sessions: updatedSessions,
    });
    toast({ title: "Subject deleted", description: `${subject.name} has been removed.` });
  }

  function handleEditSubject(subject: Subject) {
    setEditingSubject(subject);
    setSubjectFormData({
      name: subject.name,
      difficulty: subject.difficulty,
      desiredHoursPerWeek: subject.desiredHoursPerWeek,
    });
    setIsSubjectDialogOpen(true);
  }

  function toggleSessionLock(session: StudySession) {
    const updatedSessions = sessions.map((s) =>
      s.id === session.id ? { ...s, locked: !s.locked } : s
    );
    setSessions(updatedSessions);
    saveToStorage("study-plan-state", {
      subjects,
      availability,
      constraints,
      sessions: updatedSessions,
    });
  }

  function generatePlan() {
    if (subjects.length === 0) {
      toast({
        title: "No subjects",
        description: "Please add at least one subject first.",
        variant: "destructive",
      });
      return;
    }

    const unlockedSessions = sessions.filter((s) => !s.locked);
    const lockedSessions = sessions.filter((s) => s.locked);
    const newSessions: StudySession[] = [...lockedSessions];

    // Calculate total desired hours
    const totalDesiredHours = subjects.reduce((sum, s) => sum + s.desiredHoursPerWeek, 0);

    // Calculate available time blocks
    const availableSlots: Array<{ day: number; start: number; end: number }> = [];
    availability.days.forEach((active, dayIndex) => {
      if (active) {
        availability.timeBlocks.forEach((block) => {
          const start = timeToMinutes(block.start);
          const end = timeToMinutes(block.end);
          availableSlots.push({ day: dayIndex, start, end });
        });
      }
    });

    // Generate sessions for each subject
    subjects.forEach((subject) => {
      const desiredMinutes = subject.desiredHoursPerWeek * 60;
      const sessionDuration = 60; // 1 hour sessions
      const sessionsNeeded = Math.ceil(desiredMinutes / sessionDuration);

      let allocatedMinutes = 0;
      let sessionCount = 0;

      // Shuffle available slots for randomness
      const shuffledSlots = [...availableSlots].sort(() => Math.random() - 0.5);

      for (const slot of shuffledSlots) {
        if (allocatedMinutes >= desiredMinutes || sessionCount >= sessionsNeeded) break;

        // Check constraints
        const daySessions = newSessions.filter((s) => s.day === slot.day);
        if (daySessions.length >= constraints.maxSessionsPerDay) continue;

        const sessionStart = slot.start;
        const sessionEnd = sessionStart + sessionDuration;

        if (sessionEnd > slot.end) continue;

        if (constraints.avoidLateHours) {
          const threshold = timeToMinutes(constraints.lateHourThreshold);
          if (sessionEnd > threshold) continue;
        }

        // Check for conflicts with existing sessions
        const hasConflict = newSessions.some(
          (s) =>
            s.day === slot.day &&
            !(sessionEnd <= timeToMinutes(s.startTime) ||
              sessionStart >= timeToMinutes(s.endTime))
        );

        if (hasConflict) continue;

        newSessions.push({
          id: generateId(),
          subjectId: subject.id,
          day: slot.day,
          startTime: minutesToTime(sessionStart),
          endTime: minutesToTime(sessionEnd),
          locked: false,
        });

        allocatedMinutes += sessionDuration;
        sessionCount++;
      }
    });

    setSessions(newSessions);
    saveToStorage("study-plan-state", {
      subjects,
      availability,
      constraints,
      sessions: newSessions,
    });
    toast({ title: "Plan generated", description: "Your weekly study plan has been generated." });
  }

  function handleShare() {
    const state = { subjects, availability, constraints, sessions };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}/study-plan?share=${encoded}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Share link copied to clipboard!" });
  }

  function handlePrint() {
    window.print();
  }

  function handleExportICS() {
    const events = sessions.map((session) => {
      const subject = subjects.find((s) => s.id === session.subjectId);
      if (!subject) return null;

      const date = new Date();
      const dayOfWeek = date.getDay();
      const diff = session.day - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      date.setDate(date.getDate() + diff);

      const [startHours, startMinutes] = session.startTime.split(":").map(Number);
      const [endHours, endMinutes] = session.endTime.split(":").map(Number);

      date.setHours(startHours, startMinutes, 0, 0);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return {
        title: `Study: ${subject.name}`,
        start: [year, month, day, startHours, startMinutes] as [number, number, number, number, number],
        end: [year, month, day, endHours, endMinutes] as [number, number, number, number, number],
        description: `Study session for ${subject.name}`,
        status: "CONFIRMED" as const,
        busyStatus: "BUSY" as const,
      };
    }).filter(Boolean) as any[];

    const { error, value } = createEvents(events);
    if (error) {
      toast({
        title: "Export failed",
        description: "Could not create calendar file.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([value!], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "study-plan.ics";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar exported", description: "Study plan added to calendar file." });
  }

  const subjectTotals = subjects.map((subject) => {
    const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);
    const totalMinutes = subjectSessions.reduce((sum, s) => {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return sum + (end - start);
    }, 0);
    return {
      subject,
      totalHours: totalMinutes / 60,
      desiredHours: subject.desiredHoursPerWeek,
    };
  });

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Plan Generator</h1>
                <p className="text-muted-foreground">
                  Generate a balanced weekly study schedule
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button onClick={() => setIsSubjectDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
                  Settings
                </Button>
                <Button variant="outline" onClick={generatePlan}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Plan
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleExportICS}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
              </div>
            </div>

            {/* Subjects Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>
                  Add subjects with difficulty and desired study hours per week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No subjects added yet. Click &quot;Add Subject&quot; to get started.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => {
                      const total = subjectTotals.find((t) => t.subject.id === subject.id);
                      return (
                        <Card key={subject.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSubject(subject)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSubject(subject)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription>
                              Difficulty: {subject.difficulty}/5 • Desired: {subject.desiredHoursPerWeek}h/week
                              {total && (
                                <span className={`ml-2 ${total.totalHours >= total.desiredHours ? "text-green-600" : "text-yellow-600"}`}>
                                  • Actual: {total.totalHours.toFixed(1)}h
                                </span>
                              )}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Plan Grid */}
            {sessions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Weekly Study Plan</CardTitle>
                  <CardDescription>
                    Your generated study schedule. Lock sessions to keep them when regenerating.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-7 gap-4">
                    {dayNames.map((day, dayIndex) => {
                      const daySessions = sessions
                        .filter((s) => s.day === dayIndex)
                        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

                      return (
                        <div key={dayIndex} className="border rounded-lg p-3">
                          <h3 className="font-semibold mb-3">{day}</h3>
                          {daySessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sessions</p>
                          ) : (
                            <div className="space-y-2">
                              {daySessions.map((session) => {
                                const subject = subjects.find((s) => s.id === session.subjectId);
                                return (
                                  <div
                                    key={session.id}
                                    className={`p-2 rounded text-xs border ${
                                      session.locked ? "bg-muted" : ""
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <span className="font-medium">{subject?.name}</span>
                                      <button
                                        onClick={() => toggleSessionLock(session)}
                                        className="text-muted-foreground hover:text-foreground"
                                      >
                                        {session.locked ? (
                                          <Lock className="w-3 h-3" />
                                        ) : (
                                          <Unlock className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="text-muted-foreground">
                                      {session.startTime} - {session.endTime}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subjectTotals.map(({ subject, totalHours, desiredHours }) => (
                      <div key={subject.id} className="flex items-center justify-between">
                        <span>{subject.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {totalHours.toFixed(1)}h / {desiredHours}h
                          </span>
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                totalHours >= desiredHours ? "bg-green-500" : "bg-yellow-500"
                              }`}
                              style={{ width: `${Math.min(100, (totalHours / desiredHours) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Subject Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>
              Add a subject with its difficulty level and desired study hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                value={subjectFormData.name}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Select
                value={subjectFormData.difficulty.toString()}
                onValueChange={(value) =>
                  setSubjectFormData({ ...subjectFormData, difficulty: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} - {level === 1 ? "Very Easy" : level === 5 ? "Very Hard" : "Medium"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Desired Hours per Week</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="40"
                value={subjectFormData.desiredHoursPerWeek}
                onChange={(e) =>
                  setSubjectFormData({
                    ...subjectFormData,
                    desiredHoursPerWeek: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubject}>
              {editingSubject ? "Update" : "Add"} Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Study Plan Settings</DialogTitle>
            <DialogDescription>
              Configure your availability and constraints.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Days</Label>
              <div className="space-y-2 mt-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Label htmlFor={`day-${index}`} className="cursor-pointer">
                      {day}
                    </Label>
                    <Switch
                      id={`day-${index}`}
                      checked={availability.days[index]}
                      onCheckedChange={(checked) => {
                        const newDays = [...availability.days];
                        newDays[index] = checked;
                        const updatedAvailability = { ...availability, days: newDays };
                        setAvailability(updatedAvailability);
                        saveToStorage("study-plan-state", {
                          subjects,
                          availability: updatedAvailability,
                          constraints,
                          sessions,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Max Sessions per Day</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={constraints.maxSessionsPerDay}
                onChange={(e) => {
                  const updatedConstraints = {
                    ...constraints,
                    maxSessionsPerDay: parseInt(e.target.value) || 1,
                  };
                  setConstraints(updatedConstraints);
                  saveToStorage("study-plan-state", {
                    subjects,
                    availability,
                    constraints: updatedConstraints,
                    sessions,
                  });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="avoid-late">Avoid Late Hours</Label>
              <Switch
                id="avoid-late"
                checked={constraints.avoidLateHours}
                onCheckedChange={(checked) => {
                  const updatedConstraints = { ...constraints, avoidLateHours: checked };
                  setConstraints(updatedConstraints);
                  saveToStorage("study-plan-state", {
                    subjects,
                    availability,
                    constraints: updatedConstraints,
                    sessions,
                  });
                }}
              />
            </div>
            {constraints.avoidLateHours && (
              <div>
                <Label htmlFor="threshold">Late Hour Threshold</Label>
                <Input
                  id="threshold"
                  type="time"
                  value={constraints.lateHourThreshold}
                  onChange={(e) => {
                    const updatedConstraints = { ...constraints, lateHourThreshold: e.target.value };
                    setConstraints(updatedConstraints);
                    saveToStorage("study-plan-state", {
                      subjects,
                      availability,
                      constraints: updatedConstraints,
                      sessions,
                    });
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

