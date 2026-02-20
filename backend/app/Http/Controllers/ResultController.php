<?php

namespace App\Http\Controllers;

use App\Models\Result;
use Illuminate\Http\Request;

class ResultController extends Controller
{
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
}
