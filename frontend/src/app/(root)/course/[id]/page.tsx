"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

type LessonItem = {
  type: "lesson";
  id: string;
  title: string;
  content: string;
  sort_order?: number;
};

type QuizItem = {
  type: "quiz";
  id: string;
  title: string;
  description?: string;
  sort_order?: number;
};

type ContentItem = LessonItem | QuizItem;

type Set = {
  id: string;
  title: string;
  course_id: string;
  sort_order?: number;
  items: ContentItem[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
};

type QuizScore = {
  score: number;
  passed: boolean;
};

export default function CourseDetailUserPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const CourseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [activeSet, setActiveSet] = useState<Set | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [quizScores, setQuizScores] = useState<Record<string, QuizScore>>({});

  useEffect(() => {
    const submitted = searchParams.get("submitted");
    const score = searchParams.get("score");
    const passed = searchParams.get("passed");

    if (submitted === "true" && score !== null) {
      if (passed === "true") {
        toast.success(`Selamat! Kamu lulus dengan nilai ${score}% 🎉`);
      } else {
        toast.error(`Nilai kamu ${score}%. Belum lulus, coba lagi!`);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${CourseId}`);
        setCourse(res.data.data);
      } catch {}
    };
    if (CourseId) fetchCourse();
  }, [CourseId]);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/courses/${CourseId}/sets`);
      const data: Set[] = res.data.data ?? [];
      setSets(data);
      setActiveSet(data[0] ?? null);

      const quizIds = data
        .flatMap((s) => s.items)
        .filter((item) => item.type === "quiz")
        .map((item) => item.id);

      if (quizIds.length > 0) {
        const scoreRes = await api.get(
          `/api/quiz/my-scores?quiz_ids=${quizIds.join(",")}`,
        );
        setQuizScores(scoreRes.data.data ?? {});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (CourseId) fetchSets();
  }, [CourseId]);

  return (
    <div className="container px-10 mx-auto mt-10">
      <div className="flex gap-10">
        <div className="flex-1 space-y-5">
          {course && (
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="max-w-3xl text-gray-600">{course.description}</p>
            </div>
          )}

          <div className="border rounded-xl p-6 min-h-100 bg-white">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner className="size-8"/>
              </div>
            ) : activeSet ? (
              <>
                <h1 className="text-2xl font-bold mb-6">{activeSet.title}</h1>
                {activeSet.items?.length ? (
                  <div className="space-y-4">
                    {activeSet.items.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="border rounded-lg p-5 bg-gray-50"
                      >
                        {item.type === "lesson" && (
                          <>
                            <h3 className="font-semibold text-lg mb-2">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 text-justify whitespace-pre-line leading-relaxed">
                              {item.content}
                            </p>
                          </>
                        )}

                        {item.type === "quiz" &&
                          (() => {
                            const score = quizScores[item.id];
                            const hasPassed = score?.passed ?? false;

                            return (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {item.title}
                                  </h3>
                                  {item.description && (
                                    <p className="text-gray-500 text-sm mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {hasPassed ? (
                                      <CheckCircle2 className="size-4 text-green-500" />
                                    ) : (
                                      <XCircle className="size-4 text-red-400" />
                                    )}
                                    <span
                                      className={`text-sm font-medium ${
                                        hasPassed
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      Nilai: {score?.score ?? 0}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {hasPassed ? "Lulus" : "Belum lulus"}
                                    </span>
                                  </div>
                                </div>

                                {hasPassed ? (
                                  <Button variant="outline" disabled>
                                    Sudah Lulus
                                  </Button>
                                ) : (
                                  <Link
                                    href={`/quiz/${item.id}?course_id=${CourseId}`}
                                  >
                                    <Button>Kerjakan Quiz</Button>
                                  </Link>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Belum ada content di set ini.</p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Belum ada set.</p>
            )}
          </div>
        </div>
        <div className="w-75 border rounded-xl p-4 space-y-3 bg-gray-50 h-fit sticky top-10">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide px-1">
            Daftar Materi
          </h2>
          {sets.map((set) => (
            <button
              key={set.id}
              onClick={() => setActiveSet(set)}
              className={`w-full text-left border rounded-lg px-4 py-3 transition ${
                activeSet?.id === set.id
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white hover:bg-gray-100 border-gray-200"
              }`}
            >
              <p className="font-semibold text-sm line-clamp-1">{set.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
