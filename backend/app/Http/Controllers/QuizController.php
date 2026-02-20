<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Option;
use App\Models\SetItem;
use App\Models\Result;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index()
    {
        return response()->json(Quiz::all());
    }

    public function show($id)
    {
        $quiz = Quiz::with(['questions' => function ($q) {
            $q->orderBy('sort_order')->with('options');
        }])->findOrFail($id);

        return response()->json(['data' => $quiz]);
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

    public function submit(Request $request, $id)
    {
        $request->validate([
            'answers' => 'required|array',
        ]);


        $alreadyPassed = Result::where('user_id', $request->user()->id)
            ->where('quiz_id', $id)
            ->where('passed', true)
            ->exists();

        if ($alreadyPassed) {
            return response()->json([
                'message' => 'Kamu sudah lulus quiz ini.'
            ], 403);
        }

        $quiz = Quiz::with('questions.options')->findOrFail($id);
        $total = $quiz->questions->count();
        $correct = 0;

        foreach ($request->answers as $answer) {
            $option = Option::find($answer['option_id']);
            if ($option && $option->question_id == $answer['question_id'] && $option->is_correct) {
                $correct++;
            }
        }

        $score = $total > 0 ? round(($correct / $total) * 100) : 0;
        $passed = $score >= $quiz->passing_score;

        Result::create([
            'user_id' => $request->user()->id,
            'quiz_id' => $id,
            'score' => $score,
            'passed' => $passed,
        ]);

        return response()->json([
            'data' => [
                'score' => $score,
                'correct' => $correct,
                'total' => $total,
                'passed' => $passed,
                'passing_score' => $quiz->passing_score,
            ]
        ]);
    }

    public function myScores(Request $request)
    {
        $quizIds = $request->query('quiz_ids');
        if (!$quizIds) return response()->json(['data' => []]);

        $ids = explode(',', $quizIds);

        $attempts = Result::where('user_id', $request->user()->id)
            ->whereIn('quiz_id', $ids)
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique('quiz_id')
            ->keyBy('quiz_id')
            ->map(fn($a) => [
                'score' => $a->score,
                'passed' => $a->passed,
            ]);

        $result = collect($ids)->mapWithKeys(fn($id) => [
            $id => $attempts->get($id, ['score' => 0, 'passed' => false])
        ]);

        return response()->json(['data' => $result]);
    }

    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);

        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted']);
    }
}
