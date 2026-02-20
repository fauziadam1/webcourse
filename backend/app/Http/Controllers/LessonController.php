<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\SetItem;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function show($setId)
    {
        $lessons = SetItem::where('set_id', $setId)
            ->whereNotNull('lesson_id')
            ->with('lesson')
            ->orderBy('sort_order')
            ->get()
            ->pluck('lesson')
            ->filter()
            ->values();

        return response()->json([
            'data' => $lessons
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'set_id' => 'required|exists:sets,id'
        ]);

        $lesson = Lesson::create($request->only([
            'title',
            'description',
            'content'
        ]));

        $lastOrder = SetItem::where('set_id', $request->set_id)->max('sort_order');

        SetItem::create([
            'set_id' => $request->set_id,
            'lesson_id' => $lesson->id,
            'sort_order' => ($lastOrder ?? 0) + 1
        ]);

        return response()->json([
            'message' => 'Lesson created',
            'data' => $lesson
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $lesson = Lesson::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'content' => 'nullable|string'
        ]);

        $lesson->update($request->only(['title', 'description', 'content']));

        return response()->json([
            'message' => 'Lesson updated',
            'data' => $lesson
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $lesson = Lesson::findOrFail($id);

        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }
}
