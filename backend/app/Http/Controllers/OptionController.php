<?php

namespace App\Http\Controllers;

use App\Models\Option;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function index()
    {
        return response()->json(Option::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'option' => 'required|string',
            'is_correct' => 'nullable|boolean'
        ]);

        $option = Option::create([
            'question_id' => $request->question_id,
            'option' => $request->option,
            'is_correct' => $request->is_correct ?? false
        ]);

        return response()->json([
            'message' => 'Option created',
            'data' => $option
        ], 201);
    }

    public function update(Request $request, Option $option)
    {
        $request->validate([
            'option' => 'nullable|string',
            'is_correct' => 'nullable|boolean'
        ]);

        $option->update($request->only([
            'option',
            'is_correct'
        ]));

        return response()->json([
            'message' => 'Option updated',
            'data' => $option
        ]);
    }

    public function destroy(Option $option)
    {
        $option->delete();
        
        return response()->json([
            'message' => 'Option deleted'
        ]);
    }
}
