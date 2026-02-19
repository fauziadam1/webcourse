<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index()
    {
        return response()->json(Question::all());
    }

    public function store(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'question' => 'required|string'
        ]);

        $lastOrder = Question::where('quiz_id', $request->quiz_id)->max('sort_order');

        $question = Question::create([
            'quiz_id' => $request->quiz_id,
            'question' => $request->question,
            'sort_order' => ($lastOrder ?? 0) + 1
        ]);

        return response()->json([
            'message' => 'Question created',
            'data' => $question
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $question = Question::findOrFail($id);

        $request->validate([
            'question' => 'nullable|string'
        ]);

        $question->update(['question' => $request->question]);

        return response()->json([
            'message' => 'Question updated',
            'data' => $question
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin only'
            ], 403);
        }

        $question = Question::findOrFail($id);

        $question->delete();

        return response()->json([
            'message' => 'Question deleted'
        ]);
    }
}
