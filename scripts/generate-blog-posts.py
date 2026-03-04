#!/usr/bin/env python3
"""
Generate blog post templates for the remaining posts.
This creates the file structure - content will be added manually or via AI.
"""

import os
from datetime import datetime, timedelta

posts = [
    # Cluster 1 - Timetable (remaining 8)
    ("Best Timetable Time Blocks for Focus (With Examples)", "best-timetable-time-blocks-focus-examples", "Timetable / Course Schedule"),
    ("How to Avoid Schedule Conflicts: A Simple Timetable System", "how-to-avoid-schedule-conflicts-simple-timetable-system", "Timetable / Course Schedule"),
    ("Morning vs Evening Classes: How to Plan Your Week", "morning-vs-evening-classes-how-plan-your-week", "Timetable / Course Schedule"),
    ("StudyPlannerHub Timetable Tips: Color-Coding That Saves Time", "studyplannerhub-timetable-tips-color-coding-saves-time", "Timetable / Course Schedule"),
    ("Template: Weekly Class Schedule (Free + Editable)", "template-weekly-class-schedule-free-editable", "Timetable / Course Schedule"),
    ("How to Plan Labs, Tutorials, and Lectures in One Timetable", "how-to-plan-labs-tutorials-lectures-one-timetable", "Timetable / Course Schedule"),
    ("The 80/20 Timetable: Fit Classes, Commute, and Study Time", "80-20-timetable-fit-classes-commute-study-time", "Timetable / Course Schedule"),
    ("Common Timetable Mistakes Students Make (And Fixes)", "common-timetable-mistakes-students-make-fixes", "Timetable / Course Schedule"),
    
    # Cluster 2 - Exam Countdown (10)
    ("Exam Countdown: How to Plan Backwards From Your Exam Date", "exam-countdown-how-plan-backwards-exam-date", "Exam Countdown / Revision Planning"),
    ("30-Day Exam Study Plan Template (With Daily Targets)", "30-day-exam-study-plan-template-daily-targets", "Exam Countdown / Revision Planning"),
    ("14-Day Revision Timetable: A High-Impact Sprint Plan", "14-day-revision-timetable-high-impact-sprint-plan", "Exam Countdown / Revision Planning"),
    ("How Many Hours Should You Study Per Day Before an Exam?", "how-many-hours-should-study-per-day-before-exam", "Exam Countdown / Revision Planning"),
    ("Spaced Repetition Schedule for Exams (Simple Weekly Template)", "spaced-repetition-schedule-exams-simple-weekly-template", "Exam Countdown / Revision Planning"),
    ("Active Recall Study Plan: What to Do Each Day", "active-recall-study-plan-what-do-each-day", "Exam Countdown / Revision Planning"),
    ("How to Prioritize Multiple Exams (A Practical System)", "how-to-prioritize-multiple-exams-practical-system", "Exam Countdown / Revision Planning"),
    ("Last-Minute Exam Prep: A 3-Day Emergency Plan", "last-minute-exam-prep-3-day-emergency-plan", "Exam Countdown / Revision Planning"),
    ("Best Break Schedules While Studying (50/10, 25/5, 90/20)", "best-break-schedules-while-studying-50-10-25-5-90-20", "Exam Countdown / Revision Planning"),
    ("Exam Stress to Study Plan: Turning Anxiety Into Action", "exam-stress-study-plan-turning-anxiety-action", "Exam Countdown / Revision Planning"),
    
    # Cluster 3 - Study Plan Generator (10)
    ("Weekly Study Plan Generator: Create a Balanced Plan in Minutes", "weekly-study-plan-generator-create-balanced-plan-minutes", "Weekly Study Plan Generator / Productivity"),
    ("How to Build a Study Schedule Around a Part-Time Job", "how-build-study-schedule-around-part-time-job", "Weekly Study Plan Generator / Productivity"),
    ("How to Study When You Have Zero Motivation (Plan First)", "how-study-when-have-zero-motivation-plan-first", "Weekly Study Plan Generator / Productivity"),
    ("The Perfect Weekly Study Routine for College Students", "perfect-weekly-study-routine-college-students", "Weekly Study Plan Generator / Productivity"),
    ("How to Split Study Time Across Subjects (Difficulty-Based Method)", "how-split-study-time-across-subjects-difficulty-based-method", "Weekly Study Plan Generator / Productivity"),
    ("Pomodoro Study Schedule: A Full Week Example", "pomodoro-study-schedule-full-week-example", "Weekly Study Plan Generator / Productivity"),
    ("Deep Work for Students: A Weekly Plan You Can Stick To", "deep-work-students-weekly-plan-can-stick-to", "Weekly Study Plan Generator / Productivity"),
    ("How to Track Study Hours Without Burning Out", "how-track-study-hours-without-burning-out", "Weekly Study Plan Generator / Productivity"),
    ("Study Plan vs To-Do List: What Actually Helps You Score Better", "study-plan-vs-to-do-list-what-actually-helps-score-better", "Weekly Study Plan Generator / Productivity"),
    ("Printable Weekly Study Checklist (Keep It Simple)", "printable-weekly-study-checklist-keep-simple", "Weekly Study Plan Generator / Productivity"),
]

base_date = datetime(2024, 1, 17)
content_dir = "content/blog"

for i, (title, slug, category) in enumerate(posts):
    date = base_date + timedelta(days=i)
    filename = f"{content_dir}/{slug}.md"
    
    frontmatter = f"""---
title: "{title}"
slug: "{slug}"
description: "Learn effective strategies for {title.lower()}. Practical tips and examples to help you succeed."
date: "{date.strftime('%Y-%m-%d')}"
category: "{category}"
readingTime: "8 min read"
canonical: "https://studyplannerhub.com/blog/{slug}"
---

# {title}

[Content to be added - 900-1400 words]

## Introduction

[Introduction paragraph]

## Main Content

[Main content sections with H2/H3 headings]

## Conclusion

[Conclusion paragraph]

**General information provided. Adapt to your school's requirements.**

## Related Posts

- [Related post 1](/blog/related-slug-1)
- [Related post 2](/blog/related-slug-2)
"""
    
    with open(filename, 'w') as f:
        f.write(frontmatter)
    
    print(f"Created: {filename}")

print(f"\nGenerated {len(posts)} blog post templates.")

