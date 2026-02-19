<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index()
    {
        return response()->json(Enrollment::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id'
        ]);

        $enrollment = Enrollment::create($request->only([
            'user_id',
            'course_id'
        ]));

        return response()->json([
            'message' => 'Enrolled',
            'data' => $enrollment
        ], 201);
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();
        return response()->json([
            'message' => 'Enrollment removed'
        ]);
    }
}
