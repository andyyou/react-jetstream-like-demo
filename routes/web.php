<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\OtherBrowserSessionsController;
use App\Http\Controllers\CurrentUserController;
use App\Http\Controllers\ApiTokenController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/user/profile', [UserProfileController::class, 'show'])
        ->name('profile.show');
    Route::delete('/user/other-browser-sessions', [OtherBrowserSessionsController::class, 'destroy'])
        ->name('other-browser-sessions.destroy');
    Route::delete('/user', [CurrentUserController::class, 'destroy'])
        ->name('current-user.destroy');

    Route::get('/user/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('/user/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::put('/user/api-tokens/{token}', [ApiTokenController::class, 'update'])->name('api-tokens.update');
    Route::delete('/user/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');
});