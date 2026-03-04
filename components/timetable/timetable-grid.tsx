"use client";

import React, { useState } from "react";
import { TimetableClass, TimetableConfig } from "@/types/timetable";
import { timeToMinutes, minutesToTime } from "@/lib/utils";
import { useDrag, useDrop } from "react-dnd";

interface TimetableGridProps {
  classes: TimetableClass[];
  config: TimetableConfig;
  onClassClick: (classItem: TimetableClass) => void;
  onClassDoubleClick: (classItem: TimetableClass) => void;
  onClassMove?: (classId: string, newDay: number, newStartTime: string) => void;
  onEmptyCellDoubleClick?: (day: number, startTime: string) => void;
}

function ClassBlock({
  classItem,
  onDoubleClick,
  config,
}: {
  classItem: TimetableClass;
  onDoubleClick: () => void;
  config: TimetableConfig;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: "class",
    item: { id: classItem.id, day: classItem.day, startTime: classItem.startTime },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onDoubleClick={onDoubleClick}
      className={`w-full rounded-md p-1.5 text-xs cursor-move transition-all duration-200 hover:opacity-90 hover:scale-[1.02] hover:shadow-md select-none ${
        isDragging ? "opacity-50 scale-95 z-50" : "z-10"
      }`}
      style={{
        backgroundColor: classItem.color,
        color: getContrastColor(classItem.color),
      }}
    >
      <div className="font-semibold truncate">{classItem.name}</div>
      {classItem.location && (
        <div className="truncate opacity-90 text-[10px]">{classItem.location}</div>
      )}
      <div className="text-[9px] opacity-80">
        {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
      </div>
    </div>
  );
}

function TimeSlotCell({
  dayIndex,
  timeSlot,
  config,
  classes,
  onClassDoubleClick,
  onClassMove,
  onEmptyCellDoubleClick,
}: {
  dayIndex: number;
  timeSlot: string;
  config: TimetableConfig;
  classes: TimetableClass[];
  onClassDoubleClick: (classItem: TimetableClass) => void;
  onClassMove?: (classId: string, newDay: number, newStartTime: string) => void;
  onEmptyCellDoubleClick?: (day: number, startTime: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  const [{ isOver: isDropOver }, drop] = useDrop({
    accept: "class",
    drop: (item: { id: string; day: number; startTime: string }) => {
      if (onClassMove) {
        onClassMove(item.id, dayIndex, timeSlot);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  React.useEffect(() => {
    setIsOver(isDropOver);
  }, [isDropOver]);

  const slotStart = timeToMinutes(timeSlot);
  const slotEnd = slotStart + config.slotLength;
  const slotClasses = classes.filter(
    (c) =>
      c.day === dayIndex &&
      timeToMinutes(c.startTime) < slotEnd &&
      timeToMinutes(c.endTime) > slotStart
  );

  // Find the class that starts in this slot
  const classInSlot = slotClasses.find(
    (c) => timeToMinutes(c.startTime) >= slotStart && timeToMinutes(c.startTime) < slotEnd
  );

  const handleCellDoubleClick = () => {
    if (!classInSlot && onEmptyCellDoubleClick) {
      onEmptyCellDoubleClick(dayIndex, timeSlot);
    }
  };

  return (
    <td
      ref={drop}
      onDoubleClick={handleCellDoubleClick}
      className={`border-r border-b border-border relative min-h-[80px] p-1 transition-colors duration-200 cursor-pointer ${
        isOver ? "bg-primary/10 border-primary/50" : "bg-background"
      }`}
      style={{ minWidth: "120px" }}
    >
      {classInSlot ? (
        <ClassBlock
          classItem={classInSlot}
          onDoubleClick={() => onClassDoubleClick(classInSlot)}
          config={config}
        />
      ) : null}
    </td>
  );
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function TimetableGrid({
  classes,
  config,
  onClassClick,
  onClassDoubleClick,
  onClassMove,
  onEmptyCellDoubleClick,
}: TimetableGridProps) {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activeDays = config.days.map((active, index) => ({ 
    active, 
    name: dayNames[index],
    shortName: shortDayNames[index]
  })).filter(day => day.active);

  const timeSlots: string[] = [];
  const start = timeToMinutes(config.startTime);
  const end = timeToMinutes(config.endTime);
  for (let minutes = start; minutes < end; minutes += config.slotLength) {
    timeSlots.push(minutesToTime(minutes));
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <thead>
          <tr className="bg-muted/30">
            <th className="border-r border-b border-border p-3 text-xs font-medium text-muted-foreground text-left sticky left-0 bg-muted/30 z-20 min-w-[80px]">
              Time
            </th>
            {activeDays.map((day, index) => (
              <th
                key={index}
                className="border-r border-b border-border p-3 text-center text-xs font-medium text-muted-foreground last:border-r-0 min-w-[120px]"
              >
                <div className="font-semibold">{day.shortName}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{day.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={timeIndex} className="hover:bg-muted/5 transition-colors">
              <td className="border-r border-b border-border p-2 text-xs text-muted-foreground bg-muted/10 sticky left-0 z-10 font-medium">
                {formatTime(time)}
              </td>
              {activeDays.map((day, activeDayIndex) => {
                // Find the actual day index in the full week (0-6)
                // activeDays only contains active days, so we need to map back to full week index
                let actualDayIndex = -1;
                let activeCount = 0;
                for (let i = 0; i < config.days.length; i++) {
                  if (config.days[i]) {
                    if (activeCount === activeDayIndex) {
                      actualDayIndex = i;
                      break;
                    }
                    activeCount++;
                  }
                }
                
                return (
                  <TimeSlotCell
                    key={`${activeDayIndex}-${timeIndex}`}
                    dayIndex={actualDayIndex >= 0 ? actualDayIndex : activeDayIndex}
                    timeSlot={time}
                    config={config}
                    classes={classes}
                    onClassDoubleClick={onClassDoubleClick}
                    onClassMove={onClassMove}
                    onEmptyCellDoubleClick={onEmptyCellDoubleClick}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
