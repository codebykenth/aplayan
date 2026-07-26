<?php

use App\Http\Controllers\ApplicationTemplateController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FollowUpEmailController;
use App\Http\Controllers\InterviewPrepController;
use App\Http\Controllers\JobApplicationAiController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobApplicationExportController;
use App\Http\Controllers\JobApplicationImportController;
use App\Http\Controllers\JobApplicationSalaryController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('register', [AuthController::class, 'create'])->name('register');
    Route::post('register', [AuthController::class, 'store']);
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login', [AuthController::class, 'authenticate']);

    Route::get('auth/google/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
    Route::get('auth/google/callback', [SocialiteController::class, 'callback'])->name('google.callback');

    Route::get('forgot-password', [ForgotPasswordController::class, 'forgotPassword'])->name('password.request');
    Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('reset-password/{token}', [ForgotPasswordController::class, 'resetPassword'])->name('password.reset');
    Route::post('reset-password', [ForgotPasswordController::class, 'store'])->name('password.update');
});

Route::middleware('auth')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('email/verify', function (Request $request) {
        if ($request->user()?->hasVerifiedEmail()) {
            return redirect()->intended(route('job-applications.index', absolute: false));
        }

        return Inertia::render('auth/verify-email');
    })->name('verification.notice');

    Route::get('email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        return redirect()->intended(route('job-applications.index', absolute: false));
    })->middleware('signed')->name('verification.verify');

    Route::post('email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'Verification link sent!');
    })->middleware('throttle:6,1')->name('verification.send');

    Route::get('job-applications', [JobApplicationController::class, 'index'])->name('job-applications.index');
    Route::get('job-applications/export', JobApplicationExportController::class)->name('job-applications.export');
    Route::post('job-applications/import', JobApplicationImportController::class)->name('job-applications.import');
    Route::post('job-applications', [JobApplicationController::class, 'store'])->name('job-applications.store');
    Route::get('job-applications/{jobApplication}', [JobApplicationController::class, 'show'])->name('job-applications.show');
    Route::match(['put', 'patch'], 'job-applications/{jobApplication}', [JobApplicationController::class, 'update'])->name('job-applications.update');
    Route::patch('job-applications/{jobApplication}/status', [JobApplicationController::class, 'updateStatus'])->name('job-applications.status');
    Route::delete('job-applications/{jobApplication}', [JobApplicationController::class, 'destroy'])->name('job-applications.destroy');
    Route::post('job-applications/{jobApplication}/ai-match', [JobApplicationAiController::class, 'analyzeMatch'])->name('job-applications.ai-match');
    Route::post('job-applications/{jobApplication}/ai-salary', [JobApplicationSalaryController::class, 'checkSalary'])->name('job-applications.ai-salary');
    Route::post('job-applications/{jobApplication}/follow-up-draft', [FollowUpEmailController::class, 'draft'])->name('job-applications.follow-up-draft');
    Route::post('job-applications/{jobApplication}/mark-as-contacted', [FollowUpEmailController::class, 'markAsContacted'])->name('job-applications.mark-as-contacted');
    Route::post('job-applications/{jobApplication}/interview-prep', [InterviewPrepController::class, 'generate'])->name('job-applications.interview-prep');

    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::patch('settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme.update');
    Route::patch('settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');

    Route::get('templates', [ApplicationTemplateController::class, 'index'])->name('templates.index');
    Route::post('templates', [ApplicationTemplateController::class, 'store'])->name('templates.store');
    Route::match(['put', 'patch'], 'templates/{applicationTemplate}', [ApplicationTemplateController::class, 'update'])->name('templates.update');
    Route::delete('templates/{applicationTemplate}', [ApplicationTemplateController::class, 'destroy'])->name('templates.destroy');
});
