"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SetAdd } from "@/components/set-add";
import { LessonAdd } from "@/components/lesson-add";
import { QuizAdd } from "@/components/quiz-add";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { zodResolver } from "@hookform/resolvers/zod";
import { EllipsisVertical, Pencil, Trash2Icon } from "lucide-react";

//////////////////// TYPES ////////////////////

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

export default function CourseDetailPageAdmin() {
  const params = useParams<{ id: string }>();
  const CourseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [activeSet, setActiveSet] = useState<Set | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isEditLoading, setEditLoading] = useState(false);
  const [isDelLoading, setDelLoading] = useState(false);
  const [editSetId, setEditSetId] = useState<string | null>(null);

  const setSchema = z.object({
    title: z.string().min(1, "Title wajib diisi"),
  });

  type SetFormValues = z.infer<typeof setSchema>;

  const setForm = useForm<SetFormValues>({
    resolver: zodResolver(setSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/courses/${CourseId}`);
        setCourse(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    if (CourseId) fetchCourse();
  }, [CourseId]);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/courses/${CourseId}/sets`);
      const data = res.data.data ?? [];

      setSets(data);
      setActiveSet(data[0] ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (CourseId) fetchSets();
  }, [CourseId]);

  const handleDeleteSet = async (setId: string) => {
    setDelLoading(true);
    try {
      await api.delete(`/api/set/${setId}`);

      setSets((prev) => prev.filter((s) => s.id !== setId));

      if (activeSet?.id === setId) setActiveSet(null);

      toast.success("Set deleted");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Delete failed");
    } finally {
      setDelLoading(false);
    }
  };

  const handleEditSet = async (data: SetFormValues) => {
    if (!editSetId) return;

    setEditLoading(true);

    try {
      await api.put(`/api/set/${editSetId}`, data);

      setSets((prev) =>
        prev.map((s) => (s.id === editSetId ? { ...s, title: data.title } : s)),
      );

      if (activeSet?.id === editSetId) {
        setActiveSet((prev) => (prev ? { ...prev, title: data.title } : prev));
      }

      toast.success("Set updated");
      setEditSetId(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="container px-10 mx-auto mt-10">
      <div className="flex gap-10">
        <div className="flex-1 space-y-5">
          {course && (
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="max-w-3xl">{course.description}</p>
            </div>
          )}
          <div className="border rounded-xl p-6 min-h-100 bg-white">
            {activeSet ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{activeSet.title}</h2>

                  <div className="flex gap-3">
                    <LessonAdd setId={activeSet.id} onSuccess={fetchSets} />
                    <QuizAdd setId={activeSet.id} onSuccess={fetchSets} />
                  </div>
                </div>
                {isLoading ? (
                  <Spinner />
                ) : activeSet.items?.length ? (
                  <div className="space-y-3">
                    {activeSet.items.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        {item.type === "lesson" && (
                          <>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-gray-500 text-justify whitespace-pre-line">
                              {item.content}
                            </p>
                          </>
                        )}
                        {item.type === "quiz" && (
                          <>
                            <h3 className="font-semibold">
                              Quiz: {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-gray-500">
                                {item.description}
                              </p>
                            )}
                            <Button className="mt-2">Kerjakan Quiz</Button>
                          </>
                        )}
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
        <div className="w-[350px] border rounded-xl p-4 space-y-5 bg-gray-50">
          <div className="flex justify-end">
            <SetAdd courseId={CourseId} onSuccess={fetchSets} />
          </div>

          <div className="space-y-3">
            {sets.map((set) => (
              <div
                key={set.id}
                onClick={() => setActiveSet(set)}
                className={`border rounded-lg p-3 cursor-pointer transition ${
                  activeSet?.id === set.id
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h1 className="font-semibold text-sm line-clamp-1">
                    {set.title}
                  </h1>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setEditSetId(set.id);
                              setForm.setValue("title", set.title);
                            }}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Set</DialogTitle>
                            <DialogDescription>
                              Update set title.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...setForm}>
                            <form
                              onSubmit={setForm.handleSubmit(handleEditSet)}
                              className="space-y-4"
                            >
                              <FormField
                                control={setForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" className="w-full">
                                {isEditLoading ? <Spinner /> : "Save Changes"}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            {isDelLoading ? (
                              <Spinner />
                            ) : (
                              <Trash2Icon className="text-destructive" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Set?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this set.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSet(set.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
