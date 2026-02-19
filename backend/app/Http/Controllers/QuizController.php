<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\SetItem;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index()
    {
        return response()->json(Quiz::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'set_id' => 'required|exists:sets,id'
        ]);

        $quiz = Quiz::create([
            'title' => $request->title,
            'description' => $request->description,
            'passing_score' => $request->passing_score ?? 70
        ]);

        $lastOrder = SetItem::where('set_id', $request->set_id)->max('sort_order');
        
        SetItem::create([
            'set_id' => $request->set_id,
            'quiz_id' => $quiz->id,
            'sort_order' => ($lastOrder ?? 0) + 1
        ]);

        return response()->json([
            'message' => 'Quiz created',
            'data' => $quiz
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'passing_score' => 'nullable|integer|min:0|max:100'
        ]);

        $quiz->update($request->only(['title', 'description', 'passing_score']));

        return response()->json([
            'message' => 'Quiz updated',
            'data' => $quiz
        ]);
    }

    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);

        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted']);
    }
}
