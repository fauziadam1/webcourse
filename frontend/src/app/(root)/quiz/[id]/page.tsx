"use client";

import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Option = { id: string; option: string };

type Question = {
  id: string;
  question: string;
  sort_order: number;
  options: Option[];
};

type Quiz = {
  id: string;
  title: string;
  description?: string;
  passing_score: number;
  questions: Question[];
};

type Result = {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passing_score: number;
};

export default function QuizUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/quiz/${params.id}`);
        setQuiz(res.data.data);
      } catch {
        toast.error("Gagal memuat quiz");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchQuiz();
  }, [params.id]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Masih ada ${unanswered.length} soal yang belum dijawab`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(
        ([question_id, option_id]) => ({
          question_id,
          option_id,
        }),
      );

      const res = await api.post(`/api/quiz/${params.id}/submit`, {
        answers: payload,
      });

      const data = res.data.data;

      if (data.passed) {
        const courseId = searchParams.get("course_id");
        toast.success(`Selamat! Kamu lulus`);
        router.push(courseId ? `/course/${courseId}` : "/");
      } else {
        setResult(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      toast.error("Gagal submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz?.questions.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="size-8"/>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-500 mt-1">{quiz.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Nilai kelulusan: {quiz.passing_score}%
        </p>
      </div>
      {result && (
        <div
          className={`rounded-xl p-6 mb-8 text-center border ${
            result.passed
              ? "bg-green-50 border-green-300"
              : "bg-red-50 border-red-300"
          }`}
        >
          {result.passed ? (
            <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
          ) : (
            <XCircle className="mx-auto text-red-400 mb-3" size={48} />
          )}
          <h2 className="text-2xl font-bold">
            {result.passed ? "Selamat, Kamu Lulus! 🎉" : "Belum Lulus"}
          </h2>
          <p className="text-gray-600 mt-1">
            Skor kamu:{" "}
            <span className="font-bold text-xl">{result.score}%</span>{" "}
            <span className="text-sm text-gray-400">
              ({result.correct}/{result.total} benar)
            </span>
          </p>
          {!result.passed && (
            <p className="text-sm text-gray-500 mt-1">
              Kamu perlu skor minimal {result.passing_score}% untuk lulus.
            </p>
          )}
          <div className="flex gap-3 justify-center mt-5">
            <Button variant="outline" onClick={handleRetry}>
              Coba Lagi
            </Button>
            <Button onClick={() => router.back()}>Kembali ke Materi</Button>
          </div>
        </div>
      )}
      {!result && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1.5">
            <span>Progress</span>
            <span>
              {answeredCount}/{totalCount} dijawab
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width:
                  totalCount > 0
                    ? `${(answeredCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      )}
      <div className="space-y-5">
        {quiz.questions.map((q, idx) => (
          <div
            key={q.id}
            className={`border rounded-xl p-5 bg-white transition ${
              !result && !answers[q.id] ? "border-gray-200" : ""
            }`}
          >
            <p className="font-semibold mb-4">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    disabled={!!result}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition
                      ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 font-medium text-blue-500"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                      }
                      ${result ? "cursor-default" : "cursor-pointer"}
                    `}
                  >
                    <span className="mr-2 font-medium text-gray-400">
                      {String.fromCharCode(65 + q.options.indexOf(opt))}.
                    </span>
                    {opt.option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!result && (
        <div className="mt-8 flex flex-col items-center gap-2">
          {answeredCount < totalCount && (
            <p className="text-sm text-gray-400">
              Jawab semua soal sebelum submit
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < totalCount}
          >
            {isSubmitting ? <Spinner /> : "Submit Quiz"}
          </Button>
        </div>
      )}
    </div>
  );
}
