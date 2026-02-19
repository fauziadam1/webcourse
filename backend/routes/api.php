<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
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

    Route::post('/quiz', [QuizController::class, 'store']);
    Route::put('/quiz/{id}', [QuizController::class, 'update']);
    Route::delete('/quiz/{id}', [QuizController::class, 'destroy']);

    Route::post('/set', [SetController::class, 'store']);
    Route::delete('/set/{id}', [SetController::class, 'destroy']);
    Route::put('/set/{id}', [SetController::class, 'update']);

    Route::post('/question', [QuestionController::class, 'store']);

    Route::post('/option', [OptionController::class, 'store']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-admin', [AuthController::class, 'admin']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sets', [SetController::class, 'index']);
Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/lessons', [LessonController::class, 'index']);
Route::get('/courses-user', [CourseController::class, 'index']);
Route::get('/courses-admin', [CourseController::class, 'all']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/courses/{course}/sets', [SetController::class, 'show']);
