"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BookMarked, UserRound } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  sets_count: number;
  students_count: number;
};

export function CourseListEnrolled() {
  const [isLoading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/enrollments");
        setCourses(res.data.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        Tidak ada aktivitas apapun.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="line-clamp-2 text-xl">
              {course.title}
            </CardTitle>
            <CardDescription className="line-clamp-3">
              {course.description}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto flex flex-col gap-5 items-start">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <BookMarked className="size-4" />
                {course.sets_count}
              </span>
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                <UserRound className="size-4" />
                {course.students_count}
              </span>
            </div>
            <Link href={`/course/${course.id}`} className="w-full">
              <Button className="w-full bg-blue-500">Lanjut Belajar</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}