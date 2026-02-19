<?php

namespace App\Http\Controllers;

use App\Http\Resources\SetResource;
use App\Models\Set;
use Illuminate\Http\Request;

class SetController extends Controller
{
    public function index()
    {
        $set = Set::all();

        return SetResource::collection($set);
    }

    public function show($courseId)
    {
        $sets = Set::where('course_id', $courseId)
            ->orderBy('sort_order')
            ->get();

        return SetResource::collection($sets);
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
