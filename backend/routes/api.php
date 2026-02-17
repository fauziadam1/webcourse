<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/course', [CourseController::class, 'store']);
    Route::put('/course/{id}', [CourseController::class, 'update']);
    Route::delete('/course/{id}', [CourseController::class, 'delete']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-admin', [AuthController::class, 'admin']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/courses-user', [CourseController::class, 'index']);
Route::get('/courses-admin', [CourseController::class, 'all']);
