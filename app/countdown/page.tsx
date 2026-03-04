"use client";

import { useState, useEffect } from "react";
import { Exam } from "@/types/countdown";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Bell, BellOff, Trash2, Edit2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createEvents } from "ics";

export default function CountdownPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    tag: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExams = loadFromStorage<Exam[]>("countdown-exams", []);
    const savedNotifications = loadFromStorage<boolean>("countdown-notifications", false);
    
    if (savedExams && savedExams.length >= 0) {
      setExams(savedExams);
    }
    setNotificationsEnabled(savedNotifications);
  }, []);

  useEffect(() => {
    if (notificationsEnabled && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleNotifications();
        }
      });
    }
  }, [notificationsEnabled, exams]);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown
      setExams([...exams]);
    }, 60000);
    return () => clearInterval(interval);
  }, [exams]);

  function scheduleNotifications() {
    exams.forEach((exam) => {
      const examDate = new Date(exam.date);
      if (exam.time) {
        const [hours, minutes] = exam.time.split(":").map(Number);
        examDate.setHours(hours, minutes, 0, 0);
      }
      const now = new Date();
      const timeUntil = examDate.getTime() - now.getTime();

      if (timeUntil > 0 && timeUntil <= 7 * 24 * 60 * 60 * 1000) {
        // Notify 1 day before
        const oneDayBefore = timeUntil - 24 * 60 * 60 * 1000;
        if (oneDayBefore > 0) {
          setTimeout(() => {
            new Notification(`Exam Reminder: ${exam.name}`, {
              body: `Your exam is tomorrow!`,
              icon: "/logo.png",
            });
          }, oneDayBefore);
        }
      }
    });
  }

  function handleAddExam() {
    if (!formData.name || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in exam name and date.",
        variant: "destructive",
      });
      return;
    }

    const newExam: Exam = {
      id: editingExam?.id || generateId(),
      ...formData,
    };

    let updatedExams: Exam[];
    if (editingExam) {
      updatedExams = exams.map((e) => (e.id === editingExam.id ? newExam : e));
      setExams(updatedExams);
      saveToStorage("countdown-exams", updatedExams);
      toast({ title: "Exam updated", description: `${newExam.name} has been updated.` });
    } else {
      updatedExams = [...exams, newExam];
      setExams(updatedExams);
      saveToStorage("countdown-exams", updatedExams);
      toast({ title: "Exam added", description: `${newExam.name} has been added.` });
    }

    setIsAddDialogOpen(false);
    setEditingExam(null);
    setFormData({
      name: "",
      date: "",
      time: "",
      tag: "",
      priority: "medium",
    });
  }

  function handleEditExam(exam: Exam) {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      date: exam.date.split("T")[0],
      time: exam.time || "",
      tag: exam.tag || "",
      priority: exam.priority,
    });
    setIsAddDialogOpen(true);
  }

  function handleDeleteExam(exam: Exam) {
    const updatedExams = exams.filter((e) => e.id !== exam.id);
    setExams(updatedExams);
    saveToStorage("countdown-exams", updatedExams);
    toast({ title: "Exam deleted", description: `${exam.name} has been removed.` });
  }

  function handleEnableNotifications() {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsEnabled(true);
          saveToStorage("countdown-notifications", true);
          toast({ title: "Notifications enabled", description: "You'll receive reminders for your exams." });
        } else {
          toast({
            title: "Permission denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
    }
  }

  function handleExportICS() {
    const events = exams.map((exam) => {
      const examDate = new Date(exam.date);
      if (exam.time) {
        const [hours, minutes] = exam.time.split(":").map(Number);
        examDate.setHours(hours, minutes, 0, 0);
      } else {
        examDate.setHours(9, 0, 0, 0);
      }

      const year = examDate.getFullYear();
      const month = examDate.getMonth() + 1;
      const day = examDate.getDate();
      const hour = examDate.getHours();
      const minute = examDate.getMinutes();

      return {
        title: exam.name,
        start: [year, month, day, hour, minute] as [number, number, number, number, number],
        duration: { hours: 2 },
        description: exam.tag ? `Tag: ${exam.tag}` : undefined,
        status: "CONFIRMED" as const,
        busyStatus: "BUSY" as const,
      };
    });

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
    link.download = "exams.ics";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar exported", description: "Exams added to calendar file." });
  }

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

  const sortedExams = [...exams].sort((a, b) => {
    const dateA = new Date(a.date + (a.time ? `T${a.time}` : "T09:00"));
    const dateB = new Date(b.date + (b.time ? `T${b.time}` : "T09:00"));
    return dateA.getTime() - dateB.getTime();
  });

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Exam Countdown</h1>
                <p className="text-muted-foreground">
                  Track your upcoming exams with countdown timers
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exam
                </Button>
                {!notificationsEnabled && (
                  <Button variant="outline" onClick={handleEnableNotifications}>
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                )}
                {notificationsEnabled && (
                  <Button variant="outline" onClick={() => {
                    setNotificationsEnabled(false);
                    saveToStorage("countdown-notifications", false);
                    toast({ title: "Notifications disabled" });
                  }}>
                    <BellOff className="w-4 h-4 mr-2" />
                    Disable Notifications
                  </Button>
                )}
                <Button variant="outline" onClick={handleExportICS}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
              </div>
            </div>

            {exams.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground mb-4">No exams added yet.</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Exam
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedExams.map((exam) => {
                  const timeRemaining = getTimeRemaining(exam);
                  const progress = timeRemaining.isPast
                    ? 100
                    : Math.min(100, (timeRemaining.days / 30) * 100);

                  return (
                    <Card key={exam.id} className="relative">
                      <div className={`absolute top-0 left-0 right-0 h-1 ${priorityColors[exam.priority]}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{exam.name}</CardTitle>
                          {exam.tag && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {exam.tag}
                            </span>
                          )}
                        </div>
                        <CardDescription>
                          {new Date(exam.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {exam.time && ` at ${exam.time}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {timeRemaining.isPast ? (
                          <div className="text-center py-4">
                            <p className="text-2xl font-bold text-muted-foreground">
                              Exam Passed
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="text-center py-4">
                              <div className="text-4xl font-bold mb-2">
                                {timeRemaining.days}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {timeRemaining.days === 1 ? "day" : "days"}
                              </div>
                              <div className="flex justify-center gap-4 mt-4 text-sm">
                                <div>
                                  <div className="font-semibold">{timeRemaining.hours}</div>
                                  <div className="text-muted-foreground">hours</div>
                                </div>
                                <div>
                                  <div className="font-semibold">{timeRemaining.minutes}</div>
                                  <div className="text-muted-foreground">min</div>
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full transition-all ${priorityColors[exam.priority]}`}
                                style={{ width: `${100 - progress}%` }}
                              />
                            </div>
                          </>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExam(exam)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Exam Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Exam" : "Add Exam"}</DialogTitle>
            <DialogDescription>
              Add details about your upcoming exam.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Final Mathematics Exam"
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tag">Tag (optional)</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g., Math, Science"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExam}>
              {editingExam ? "Update" : "Add"} Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

