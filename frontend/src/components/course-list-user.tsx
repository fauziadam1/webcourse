"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
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

export function CourseListUser() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [courses, setCourse] = useState<Course[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/courses-user");

        setCourse(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, []);

  const handleEnroll = async (courseId: number) => {
    setLoadingId(courseId);

    try {
      await api.post("/api/enroll", {
        course_id: courseId,
      });

      toast.success("Berhasil mendaftar course");
      setCourse((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c)),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Enroll failed";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container px-10 py-10 mx-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Daftar Course</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="size-8" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden transition-all">
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
                  {course.enrolled ? (
                    <Link href={`/course/${course.id}`} className="w-full">
                      <Button className="w-full bg-blue-500">
                        Lihat Course
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (!user) {
                          router.push("/login");
                          return;
                        }
                        handleEnroll(course.id);
                      }}
                      disabled={loadingId === course.id}
                    >
                      {loadingId === course.id ? <Spinner /> : "Daftar Course"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
