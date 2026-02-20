<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/course', [CourseController::class, 'store']);
    Route::put('/course/{id}', [CourseController::class, 'update']);
    Route::delete('/course/{id}', [CourseController::class, 'destroy']);

    Route::post('/lesson', [LessonController::class, 'store']);
    Route::put('/lesson/{id}', [LessonController::class, 'update']);
    Route::get('/sets/{setId}/lessons', [LessonController::class, 'show']);

    Route::post('/quiz', [QuizController::class, 'store']);
    Route::get('/quiz/my-scores', [QuizController::class, 'myScores']); 
    Route::get('/quiz/{id}', [QuizController::class, 'show']);           
    Route::put('/quiz/{id}', [QuizController::class, 'update']);
    Route::delete('/quiz/{id}', [QuizController::class, 'destroy']);
    Route::post('/quiz/{id}/submit', [QuizController::class, 'submit']);

    Route::post('/set', [SetController::class, 'store']);
    Route::delete('/set/{id}', [SetController::class, 'destroy']);
    Route::put('/set/{id}', [SetController::class, 'update']);

    Route::post('/question', [QuestionController::class, 'store']);
    Route::delete('/question/{id}', [QuestionController::class, 'destroy']);

    Route::post('/option', [OptionController::class, 'store']);
    Route::delete('/option/{option}', [OptionController::class, 'destroy']);

    Route::post('/enroll', [EnrollmentController::class, 'store']);
    Route::delete('/enroll/{courseId}', [EnrollmentController::class, 'destroy']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-admin', [AuthController::class, 'admin']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sets/{set}/items', [SetController::class, 'items']);
Route::get('/courses-user', [CourseController::class, 'index']);
Route::get('/courses-admin', [CourseController::class, 'all']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/courses/{course}/sets', [SetController::class, 'byCourse']);
