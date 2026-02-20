<?php

namespace App\Http\Controllers;

use App\Models\Set;
use App\Models\SetItem;
use Illuminate\Http\Request;
use App\Http\Resources\SetResource;

class SetController extends Controller
{
    public function index()
    {
        $set = Set::all();

        return SetResource::collection($set);
    }

    public function show($setId)
    {
        $set = Set::with('course')->findOrFail($setId);

        $items = SetItem::where('set_id', $setId)
            ->with(['lesson', 'quiz'])
            ->orderBy('sort_order')
            ->get()
            ->map(function ($item) {
                if ($item->lesson_id && $item->lesson) {
                    return [
                        'type' => 'lesson',
                        'id' => $item->lesson->id,
                        'title' => $item->lesson->title,
                        'content' => $item->lesson->content,
                        'sort_order' => $item->sort_order,
                    ];
                }

                if ($item->quiz_id && $item->quiz) {
                    return [
                        'type' => 'quiz',
                        'id' => $item->quiz->id,
                        'title' => $item->quiz->title,
                        'description' => $item->quiz->description,
                        'sort_order' => $item->sort_order,
                    ];
                }

                return null;
            })
            ->filter()
            ->values();

        return response()->json([
            'data' => [
                'id' => $set->id,
                'title' => $set->title,
                'course_id' => $set->course_id,
                'items' => $items,
            ]
        ]);
    }

    public function byCourse($courseId)
    {
        $sets = Set::where('course_id', $courseId)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($set) {
                $items = SetItem::where('set_id', $set->id)
                    ->with(['lesson', 'quiz'])
                    ->orderBy('sort_order')
                    ->get()
                    ->map(function ($item) {
                        if ($item->lesson_id && $item->lesson) {
                            return [
                                'type' => 'lesson',
                                'id' => $item->lesson->id,
                                'title' => $item->lesson->title,
                                'content' => $item->lesson->content,
                                'sort_order' => $item->sort_order,
                            ];
                        }
                        if ($item->quiz_id && $item->quiz) {
                            return [
                                'type' => 'quiz',
                                'id' => $item->quiz->id,
                                'title' => $item->quiz->title,
                                'description' => $item->quiz->description,
                                'sort_order' => $item->sort_order,
                            ];
                        }
                        return null;
                    })
                    ->filter()
                    ->values();
                return [
                    'id' => $set->id,
                    'title' => $set->title,
                    'course_id' => $set->course_id,
                    'sort_order' => $set->sort_order,
                    'items' => $items,
                ];
            });
        return response()->json(['data' => $sets]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string',
            'sort_order' => 'nullable|integer'
        ]);

        $lastOrder = Set::where('course_id', $request->course_id)->max('sort_order');

        $set = Set::create([
            'course_id' => $request->course_id,
            'title' => $request->title,
            'sort_order' => ($lastOrder ?? 0) + 1
        ]);

        return response()->json([
            'message' => 'Set created',
            'data' => $set
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $set = Set::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string',
        ]);

        $set->update($request->only('title'));

        return response()->json([
            'message' => 'Set updated',
            'data' => $set
        ]);
    }

    public function destroy($id)
    {
        $set = Set::findOrFail($id);

        $set->delete();
        return response()->json(['message' => 'Set deleted']);
    }
}
