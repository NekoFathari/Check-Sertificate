<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/dashboard', function () {
    return view('dashboard.index');
})->name('home');

Route::get('/login', [UserController::class, 'index'])->name('login');
Route::POST('/login-proses', [UserController::class, 'login_proses'])->name('login-proses');
Route::get('/logout', [UserController::class, 'logout'])->name('logout');
route::POST('/import', [UserController::class, 'import'])->name('import');
Route::get('/check', function () {
    return view('check');
});

Route::get('/', function () {
    return view('check');
});


