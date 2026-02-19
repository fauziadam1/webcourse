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
            'course_id' => 'required|exists:courses,id'
        ]);

        $user = $request->user()->id;

        $exists = Enrollment::where('user_id', $user)
            ->where('course_id', $request->course_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Already enrolled'
            ], 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => $user,
            'course_id' => $request->course_id
        ]);

        return response()->json([
            'message' => 'Enrolled',
            'data' => $enrollment
        ], 201);
    }

    public function destroy(Request $request, $courseId)
    {
        $request->user()
            ->enrollments()
            ->where('course_id', $courseId)
            ->delete();

        return response()->json([
            'message' => 'Unenrolled'
        ]);
    }
}
