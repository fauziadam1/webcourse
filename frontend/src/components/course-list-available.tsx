"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useAuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
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
  enrolled?: boolean;
};

export function CourseListAvailable() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/courses-user");
        const all: Course[] = res.data.data ?? [];

        const available = all.filter((c) => !c.enrolled);
        setCourses(available);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: number) => {
    setLoadingId(courseId);
    try {
      await api.post("/api/enroll", { course_id: courseId });
      toast.success("Berhasil mendaftar course");
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Enroll gagal");
    } finally {
      setLoadingId(null);
    }
  };

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
        Semua course sudah kamu ikuti!
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
            <Button
              className="w-full"
              disabled={loadingId === course.id}
              onClick={() => {
                if (!user) {
                  router.push("/login");
                  return;
                }
                handleEnroll(course.id);
              }}
            >
              {loadingId === course.id ? <Spinner /> : "Daftar Course"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}