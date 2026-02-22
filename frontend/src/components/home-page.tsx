"use client";

import Link from "next/link";
import { useAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CourseListEnrolled } from "./course-list-enrolled";
import { CourseListAvailable } from "./course-list-available";

export default function HomePage() {
  const { user } = useAuthUser();

  return (
    <div className="space-y-10">
      <div className="border-b bg-gray-50">
        <div className="container px-10 py-16 mx-auto space-y-4">
          <h1 className="font-bold text-3xl">
            Selamat datang{user ? `, ${user.username}` : ""}!
          </h1>
          <p className="text-gray-500 text-sm">
            Belajar gratis dan tingkatkan skill mu bersama kami.
          </p>
          {!user && (
            <div className="flex gap-3 pt-2">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="container px-10 mx-auto space-y-12">
        {user && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Aktivitas Belajar</h2>
            <CourseListEnrolled />
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Tingkatkan Skillmu!</h2>
          <CourseListAvailable />
        </section>
      </div>
    </div>
  );
}
