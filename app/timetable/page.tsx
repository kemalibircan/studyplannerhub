"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TimetableClass, TimetableConfig } from "@/types/timetable";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { generateId, timeToMinutes, minutesToTime } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TimetableGrid from "@/components/timetable/timetable-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, Download, Share2, Printer, FileDown, MousePointer2, Move, Edit2, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DEFAULT_CONFIG: TimetableConfig = {
  startTime: "08:00",
  endTime: "20:00",
  slotLength: 30,
  days: [true, true, true, true, true, false, false],
};

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export default function TimetablePage() {
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [config, setConfig] = useState<TimetableConfig>(DEFAULT_CONFIG);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    color: COLORS[0],
    location: "",
    teacher: "",
    day: 0,
    startTime: "09:00",
    endTime: "10:00",
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClasses = loadFromStorage<TimetableClass[]>("timetable-classes", []);
    const savedConfig = loadFromStorage<TimetableConfig>("timetable-config", DEFAULT_CONFIG);
    
    if (savedClasses && savedClasses.length >= 0) {
      setClasses(savedClasses);
    }
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  // Only check conflicts when classes change, don't save (saving is done in functions)
  useEffect(() => {
    checkConflicts();
  }, [classes]);

  function checkConflicts() {
    const conflictIds: string[] = [];
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const a = classes[i];
        const b = classes[j];
        if (
          a.day === b.day &&
          !(a.endTime <= b.startTime || b.endTime <= a.startTime)
        ) {
          conflictIds.push(a.id, b.id);
        }
      }
    }
    setConflicts(conflictIds);
  }

  function handleAddClass() {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const start = timeToMinutes(formData.startTime);
    const end = timeToMinutes(formData.endTime);
    if (end <= start) {
      toast({
        title: "Invalid time",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    const newClass: TimetableClass = {
      id: editingClass?.id || generateId(),
      ...formData,
    };

    let updatedClasses: TimetableClass[];
    if (editingClass) {
      updatedClasses = classes.map((c) => (c.id === editingClass.id ? newClass : c));
      setClasses(updatedClasses);
      saveToStorage("timetable-classes", updatedClasses);
      toast({ title: "Class updated", description: `${newClass.name} has been updated.` });
    } else {
      updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      saveToStorage("timetable-classes", updatedClasses);
      toast({ title: "Class added", description: `${newClass.name} has been added.` });
    }

    setIsAddDialogOpen(false);
    setEditingClass(null);
    setFormData({
      name: "",
      color: COLORS[0],
      location: "",
      teacher: "",
      day: 0,
      startTime: "09:00",
      endTime: "10:00",
    });
  }

  function handleEditClass(classItem: TimetableClass) {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      color: classItem.color,
      location: classItem.location || "",
      teacher: classItem.teacher || "",
      day: classItem.day,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
    });
    setIsAddDialogOpen(true);
  }

  function handleDeleteClass(classItem: TimetableClass) {
    const updatedClasses = classes.filter((c) => c.id !== classItem.id);
    setClasses(updatedClasses);
    saveToStorage("timetable-classes", updatedClasses);
    toast({ title: "Class deleted", description: `${classItem.name} has been removed.` });
  }

  function handleDuplicateClass(classItem: TimetableClass) {
    const duplicated: TimetableClass = {
      ...classItem,
      id: generateId(),
      name: `${classItem.name} (Copy)`,
    };
    const updatedClasses = [...classes, duplicated];
    setClasses(updatedClasses);
    saveToStorage("timetable-classes", updatedClasses);
    toast({ title: "Class duplicated", description: `${duplicated.name} has been added.` });
  }

  function handleClassMove(classId: string, newDay: number, newStartTime: string) {
    const classItem = classes.find((c) => c.id === classId);
    if (!classItem) return;

    const start = timeToMinutes(newStartTime);
    const end = timeToMinutes(classItem.endTime);
    const duration = end - timeToMinutes(classItem.startTime);
    const newEndTime = minutesToTime(start + duration);

    const updated: TimetableClass = {
      ...classItem,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
    };

    const updatedClasses = classes.map((c) => (c.id === classId ? updated : c));
    setClasses(updatedClasses);
    saveToStorage("timetable-classes", updatedClasses);
    toast({
      title: "Class moved",
      description: `${classItem.name} has been moved.`,
    });
  }

  function handleEmptyCellDoubleClick(day: number, startTime: string) {
    const start = timeToMinutes(startTime);
    const endTime = minutesToTime(start + config.slotLength);
    
    setFormData({
      name: "",
      color: COLORS[0],
      location: "",
      teacher: "",
      day: day,
      startTime: startTime,
      endTime: endTime,
    });
    setEditingClass(null);
    setIsAddDialogOpen(true);
  }

  function handleShare() {
    const state = { classes, config };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}/timetable?share=${encoded}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Share link copied to clipboard!" });
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportImage() {
    const element = document.getElementById("timetable-grid");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "timetable.png";
      link.href = url;
      link.click();
      toast({ title: "Image exported", description: "Timetable saved as image." });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export image. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleExportPDF(orientation: "portrait" | "landscape" = "portrait") {
    const element = document.getElementById("timetable-grid");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.setFontSize(12);
      pdf.text("StudyPlannerHub - Weekly Timetable", pdfWidth / 2, 15, { align: "center" });
      pdf.text(new Date().toLocaleDateString(), pdfWidth / 2, pdfHeight - 10, { align: "center" });

      pdf.save("timetable.pdf");
      toast({ title: "PDF exported", description: "Timetable saved as PDF." });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export PDF. Please try again.",
        variant: "destructive",
      });
    }
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <DndProvider backend={HTML5Backend}>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Timetable Builder</h1>
                <p className="text-muted-foreground">
                  Create and manage your weekly class schedule
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleExportImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button variant="outline" onClick={() => handleExportPDF("portrait")}>
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>

            {conflicts.length > 0 && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive font-medium">
                    ⚠️ Schedule conflicts detected. Some classes overlap on the same day.
                  </p>
                </CardContent>
              </Card>
            )}

            <div id="timetable-grid" className="mb-6">
              <TimetableGrid
                classes={classes}
                config={config}
                onClassClick={handleEditClass}
                onClassDoubleClick={handleEditClass}
                onClassMove={handleClassMove}
                onEmptyCellDoubleClick={handleEmptyCellDoubleClick}
              />
            </div>
            
            {classes.length === 0 && (
              <Card className="mb-6">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground mb-4">No classes added yet. Add your first class above!</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Class
                  </Button>
                </CardContent>
              </Card>
            )}

            {classes.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Your Classes</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((classItem) => (
                    <Card
                      key={classItem.id}
                      className={conflicts.includes(classItem.id) ? "border-destructive" : ""}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: classItem.color }}
                            />
                            <CardTitle className="text-lg">{classItem.name}</CardTitle>
                          </div>
                        </div>
                        <CardDescription>
                          {dayNames[classItem.day]} • {classItem.startTime} - {classItem.endTime}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {classItem.location && (
                          <p className="text-sm text-muted-foreground mb-1">
                            📍 {classItem.location}
                          </p>
                        )}
                        {classItem.teacher && (
                          <p className="text-sm text-muted-foreground mb-4">
                            👤 {classItem.teacher}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClass(classItem)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateClass(classItem)}
                          >
                            Duplicate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClass(classItem)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Guide */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <CardTitle>How to Use Timetable Builder</CardTitle>
                </div>
                <CardDescription>
                  Learn the shortcuts and features to get the most out of your timetable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Basic Actions */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Adding Classes
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Click <strong>"Add Class"</strong> button to create a new class</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Double-click</strong> any empty cell to quickly add a class at that time slot</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Fill in class name, day, time, color, and optional details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Use color coding to organize by subject or type</span>
                      </li>
                    </ul>
                  </div>

                  {/* Drag & Drop */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Moving Classes
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Drag and drop</strong> any class block to move it to a different day or time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Hover over a cell to see the drop zone highlight</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>The class duration is preserved when moving</span>
                      </li>
                    </ul>
                  </div>

                  {/* Editing */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Editing Classes
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Double-click</strong> any class block to edit its details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Or click <strong>"Edit"</strong> button in the class card below</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Change name, time, location, teacher, or color anytime</span>
                      </li>
                    </ul>
                  </div>

                  {/* Shortcuts & Tips */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MousePointer2 className="w-4 h-4" />
                      Tips & Shortcuts
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Use <strong>Settings</strong> to adjust time range and slot length</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Toggle days on/off to show only weekdays or include weekends</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Export as PDF or Image for printing or sharing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Conflicts are automatically detected and highlighted in red</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Add new class</span>
                      <kbd className="px-2 py-1 bg-background border rounded text-xs">+ Button</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Add class (quick)</span>
                      <kbd className="px-2 py-1 bg-background border rounded text-xs">Double-click empty cell</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Edit class</span>
                      <kbd className="px-2 py-1 bg-background border rounded text-xs">Double-click class</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Move class</span>
                      <kbd className="px-2 py-1 bg-background border rounded text-xs">Drag & Drop</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Open settings</span>
                      <kbd className="px-2 py-1 bg-background border rounded text-xs">⚙️ Button</kbd>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add/Edit Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Add Class"}</DialogTitle>
            <DialogDescription>
              Fill in the details for your class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics 101"
              />
            </div>
            <div>
              <Label htmlFor="day">Day</Label>
              <Select
                value={formData.day.toString()}
                onValueChange={(value) => {
                  const dayIndex = parseInt(value, 10);
                  if (!isNaN(dayIndex)) {
                    setFormData({ ...formData, day: dayIndex });
                  }
                }}
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded border-2 ${
                      formData.color === color ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 201"
              />
            </div>
            <div>
              <Label htmlFor="teacher">Teacher (optional)</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                placeholder="e.g., Dr. Smith"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClass}>
              {editingClass ? "Update" : "Add"} Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timetable Settings</DialogTitle>
            <DialogDescription>
              Configure your timetable display options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={config.startTime}
                  onChange={(e) => {
                    const updatedConfig = { ...config, startTime: e.target.value };
                    setConfig(updatedConfig);
                    saveToStorage("timetable-config", updatedConfig);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={config.endTime}
                  onChange={(e) => {
                    const updatedConfig = { ...config, endTime: e.target.value };
                    setConfig(updatedConfig);
                    saveToStorage("timetable-config", updatedConfig);
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="slotLength">Time Slot Length</Label>
                <Select
                  value={config.slotLength.toString()}
                  onValueChange={(value) => {
                    const updatedConfig = { ...config, slotLength: parseInt(value) as 30 | 45 | 60 };
                    setConfig(updatedConfig);
                    saveToStorage("timetable-config", updatedConfig);
                  }}
                >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Days to Show</Label>
              <div className="space-y-2 mt-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Label htmlFor={`day-${index}`} className="cursor-pointer">
                      {day}
                    </Label>
                    <Switch
                      id={`day-${index}`}
                      checked={config.days[index]}
                      onCheckedChange={(checked) => {
                        const newDays = [...config.days];
                        newDays[index] = checked;
                        const updatedConfig = { ...config, days: newDays };
                        setConfig(updatedConfig);
                        saveToStorage("timetable-config", updatedConfig);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsConfigDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </DndProvider>
  );
}

