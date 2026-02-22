"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BookMarked, UserRound, BookOpen } from "lucide-react";
import { api } from "@/lib/axios";
import { useAuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Course = {
  id: number;
  title: string;
  description: string;
  sets_count: number;
  students_count: number;
  enrolled?: boolean;
};

export default function CoursePage() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/courses-user");
        setCourses(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => !c.enrolled)
      .filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      );
  }, [courses, search]);

  const handleEnroll = async (courseId: number) => {
    setLoadingId(courseId);

    try {
      await api.post("/api/enroll", { course_id: courseId });

      toast.success("Berhasil mendaftar course");

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
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
    <div className="min-h-screen bg-muted/40">
      <section className="border-b bg-background">
        <div className="container mx-auto px-10 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Temukan Course Baru
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Pilih kursus yang ingin kamu pelajari dan mulai perjalananmu sekarang.
          </p>
          <div className="mt-6 max-w-md">
            <Input
              placeholder="Cari course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-10 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-8" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            Tidak ada course tersedia
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden transition hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-xl">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-4 mt-auto items-start">
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
                    onClick={() => {
                      if (!user) {
                        router.push("/login");
                        return;
                      }
                      handleEnroll(course.id);
                    }}
                    disabled={loadingId === course.id}
                  >
                    {loadingId === course.id ? (
                      <Spinner />
                    ) : (
                      "Daftar Course"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}