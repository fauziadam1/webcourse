<?php

namespace App\Http\Controllers;

use App\Http\Resources\RegisterResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:users',
            'email' => 'required|email|unqiue:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil',
            'data' => new RegisterResource($user)
        ]);
    }

    public function admin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin'
        ]);

        return response()->json([
            'message' => 'Admin berhasil dibuat',
            'data' => new RegisterResource($admin)
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string'
        ]);

        $user = User::where('name', $request->name)->first();

        if (!$user || Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'message' => ['Username atau password salah']
            ]);
        }

        // Auth::login($user);
        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'data' => $user
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}
