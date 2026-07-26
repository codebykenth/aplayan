<?php

use App\Http\Controllers\JobApplicationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/login', fn () => redirect('/'))->name('login');

Route::middleware('auth')->group(function () {
    Route::resource('job-applications', JobApplicationController::class)
        ->only(['index', 'store', 'update', 'destroy', 'show']);
});
