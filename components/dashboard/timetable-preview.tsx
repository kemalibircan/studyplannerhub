"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadFromStorage } from "@/lib/storage";
import { TimetableClass, TimetableConfig } from "@/types/timetable";

export default function TimetablePreview() {
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [config, setConfig] = useState<TimetableConfig | null>(null);

  useEffect(() => {
    const savedClasses = loadFromStorage<TimetableClass[]>("timetable-classes", []);
    const savedConfig = loadFromStorage<TimetableConfig>("timetable-config", null);
    setClasses(savedClasses);
    setConfig(savedConfig);
  }, []);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const sampleTimes = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group h-full" onClick={() => window.location.href = "/timetable"}>
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Timetable Builder</CardTitle>
        <CardDescription>
          Create and manage your weekly class schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mini Timetable Preview */}
        <div className="mb-4 border rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-6 gap-0 text-[10px]">
            <div className="bg-muted/30 p-1 font-semibold text-center border-r border-b">Time</div>
            {dayNames.slice(0, 5).map((day) => (
              <div key={day} className="bg-muted/30 p-1 font-semibold text-center border-r border-b last:border-r-0">
                {day}
              </div>
            ))}
            {sampleTimes.map((time, idx) => (
              <React.Fragment key={time}>
                <div className="bg-muted/10 p-1 text-center border-r border-b text-[9px]">
                  {time.split(":")[0]}:{time.split(":")[1]}
                </div>
                {dayNames.slice(0, 5).map((day, dayIdx) => {
                  const classInSlot = classes.find(
                    (c) => c.day === dayIdx && c.startTime === time
                  );
                  return (
                    <div
                      key={`${day}-${time}`}
                      className="border-r border-b last:border-r-0 min-h-[20px] p-0.5"
                    >
                      {classInSlot && (
                        <div
                          className="w-full h-full rounded text-[8px] p-0.5 text-white font-semibold truncate"
                          style={{ backgroundColor: classInSlot.color }}
                        >
                          {classInSlot.name.substring(0, 8)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{classes.length} {classes.length === 1 ? "class" : "classes"} added</span>
          {config && (
            <span className="text-xs">
              {config.startTime} - {config.endTime}
            </span>
          )}
        </div>

        <Button asChild className="w-full group-hover:bg-primary/90">
          <Link href="/timetable">
            Open Timetable <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

