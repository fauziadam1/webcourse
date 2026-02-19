<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Resources\CourseShowUserResource;

class CourseController extends Controller
{
    public function index()
    {
        $course = Course::where('is_published', true)->get();

        return CourseShowUserResource::collection($course);
    }

    public function all(Request $request)
    {
        $course = Course::all();

        return CourseShowUserResource::collection($course);
    }

    public function show($id)
    {
        $course = Course::findOrFail($id);

        return response()->json([
            'data' => $course
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
            'description' => 'required|string',
            'is_published' => 'sometimes|boolean'
        ]);

        $course = Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'is_published' => $request->is_published ?? false
        ]);

        return response()->json([
            'message' => 'Course created',
            'data' => $course
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $course = Course::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'is_published' => 'sometimes|boolean'
        ]);

        $data = $request->only([
            'title',
            'description',
            'is_published'
        ]);

        $course->update($data);

        return response()->json([
            'message' => 'Course updated',
            'data' => $course
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $course = Course::findOrFail($id);

        $course->delete();

        return response()->json([
            'message' => 'Course deleted'
        ]);
    }
}
