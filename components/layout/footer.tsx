"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function FooterLogoImage() {
  const [logoError, setLogoError] = useState(false);
  
  if (logoError) {
    return (
      <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center">
        <span className="text-primary font-bold text-xs">SPH</span>
      </div>
    );
  }
  
  return (
    <Image
      src="/logo.png"
      alt="StudyPlannerHub"
      width={24}
      height={24}
      className="object-contain"
      onError={() => setLogoError(true)}
    />
  );
}

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <FooterLogoImage />
              <span className="font-semibold">StudyPlannerHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free tools to help students plan their studies and ace their exams.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/timetable" className="text-muted-foreground hover:text-foreground">
                  Timetable Builder
                </Link>
              </li>
              <li>
                <Link href="/countdown" className="text-muted-foreground hover:text-foreground">
                  Exam Countdown
                </Link>
              </li>
              <li>
                <Link href="/study-plan" className="text-muted-foreground hover:text-foreground">
                  Study Plan Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} StudyPlannerHub. All rights reserved.
          </p>
          <p className="mt-2">
            <a 
              href="mailto:info@globaldijital.com" 
              className="text-primary hover:underline"
            >
              info@globaldijital.com
            </a>
          </p>
          <p className="mt-2">
            General information provided. Adapt to your school&apos;s requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}

