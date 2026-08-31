<?php

use App\Http\Controllers\Admin\AiUsageController;
use App\Http\Controllers\Admin\LegalDocumentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ApplicationTemplateController;
use App\Http\Controllers\Auth\AcceptTermsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FollowUpEmailController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\InterviewPrepController;
use App\Http\Controllers\JobApplicationAiController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobApplicationExportController;
use App\Http\Controllers\JobApplicationImportController;
use App\Http\Controllers\JobApplicationSalaryController;
use App\Http\Controllers\OfferComparisonController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TermsOfServiceController;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('robots.txt', function () {
    $sitemapUrl = rtrim((string) config('app.url'), '/').'/sitemap.xml';
    $content = "User-agent: *\n\n";
    $content .= "# Public pages - allow all\n";
    $content .= "Allow: /\n";
    $content .= "Allow: /privacy-policy\n";
    $content .= "Allow: /terms-of-service\n";
    $content .= "Allow: /login\n";
    $content .= "Allow: /register\n";
    $content .= "Allow: /auth/google/\n\n";
    $content .= "# Private / authenticated pages - disallow\n";
    $content .= "Disallow: /dashboard\n";
    $content .= "Disallow: /job-applications/\n";
    $content .= "Disallow: /documents/\n";
    $content .= "Disallow: /settings/\n";
    $content .= "Disallow: /analytics/\n";
    $content .= "Disallow: /goals/\n";
    $content .= "Disallow: /calendar/\n";
    $content .= "Disallow: /templates/\n";
    $content .= "Disallow: /contacts/\n";
    $content .= "Disallow: /email/\n";
    $content .= "Disallow: /auth/google/callback\n";
    $content .= "Disallow: /forgot-password\n";
    $content .= "Disallow: /reset-password/\n\n";
    $content .= "Sitemap: $sitemapUrl\n";

    return response($content, 200, ['Content-Type' => 'text/plain']);
})->name('robots');

Route::get('privacy-policy', PrivacyPolicyController::class)->name('privacy-policy');
Route::get('terms-of-service', TermsOfServiceController::class)->name('terms-of-service');

Route::middleware('guest')->group(function () {
    Route::get('register', [AuthController::class, 'create'])->name('register');
    Route::post('register', [AuthController::class, 'store'])->middleware('throttle:3,1');

    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login', [AuthController::class, 'authenticate'])->middleware('throttle:5,1');

    Route::get('auth/google/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
    Route::get('auth/google/callback', [SocialiteController::class, 'callback'])->name('google.callback');

    Route::get('forgot-password', [ForgotPasswordController::class, 'forgotPassword'])->name('password.request');
    Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('reset-password/{token}', [ForgotPasswordController::class, 'resetPassword'])->name('password.reset');
    Route::post('reset-password', [ForgotPasswordController::class, 'store'])->name('password.update');
});

Route::get('email/verify/{id}/{hash}', function (Request $request, string $id, string $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        throw new AuthorizationException;
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    Auth::login($user);

    return redirect()->route('dashboard')->with('status', 'Email verified successfully! Welcome to Aplayan.');
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('email/verify', function (Request $request) {
        if ($request->user()?->hasVerifiedEmail()) {
            return redirect()->intended(route('job-applications.index', absolute: false));
        }

        return Inertia::render('auth/verify-email');
    })->name('verification.notice');

    Route::post('email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'Verification link sent!');
    })->middleware('throttle:6,1')->name('verification.send');

    Route::post('terms/accept', AcceptTermsController::class)->name('terms.accept');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard')->middleware('throttle:read');

    Route::get('calendar', CalendarController::class)->name('calendar')->middleware('throttle:read');
    Route::get('analytics', AnalyticsController::class)->name('analytics')->middleware('throttle:read');

    Route::get('goals', [GoalController::class, 'index'])->name('goals.index')->middleware('throttle:read');
    Route::patch('goals', [GoalController::class, 'update'])->name('goals.update')->middleware('throttle:write');

    Route::get('job-applications', [JobApplicationController::class, 'index'])->name('job-applications.index')->middleware('throttle:read');
    Route::get('job-applications/offers', OfferComparisonController::class)->name('job-applications.offers')->middleware('throttle:read');
    Route::get('job-applications/export', JobApplicationExportController::class)->name('job-applications.export')->middleware('throttle:read');
    Route::post('job-applications/import', JobApplicationImportController::class)->name('job-applications.import')->middleware('throttle:write');
    Route::post('job-applications', [JobApplicationController::class, 'store'])->name('job-applications.store')->middleware('throttle:write');
    Route::get('job-applications/{jobApplication}', [JobApplicationController::class, 'show'])->name('job-applications.show')->middleware('throttle:read');
    Route::match(['put', 'patch'], 'job-applications/{jobApplication}', [JobApplicationController::class, 'update'])->name('job-applications.update')->middleware('throttle:update');
    Route::post('job-applications/{jobApplication}/interview-date', [JobApplicationController::class, 'updateInterviewDate'])->name('job-applications.interview-date')->middleware('throttle:update');
    Route::patch('job-applications/{jobApplication}/status', [JobApplicationController::class, 'updateStatus'])->name('job-applications.status')->middleware('throttle:update');
    Route::delete('job-applications/{jobApplication}', [JobApplicationController::class, 'destroy'])->name('job-applications.destroy')->middleware('throttle:delete');
    Route::post('job-applications/{jobApplication}/ai-match', [JobApplicationAiController::class, 'analyzeMatch'])->name('job-applications.ai-match')->middleware(['throttle:write', 'throttle:ai']);
    Route::post('job-applications/{jobApplication}/ai-salary', [JobApplicationSalaryController::class, 'checkSalary'])->name('job-applications.ai-salary')->middleware(['throttle:write', 'throttle:ai']);
    Route::post('job-applications/{jobApplication}/follow-up-draft', [FollowUpEmailController::class, 'draft'])->name('job-applications.follow-up-draft')->middleware('throttle:write');
    Route::post('job-applications/{jobApplication}/mark-as-contacted', [FollowUpEmailController::class, 'markAsContacted'])->name('job-applications.mark-as-contacted')->middleware('throttle:write');
    Route::post('job-applications/{jobApplication}/interview-prep', [InterviewPrepController::class, 'generate'])->name('job-applications.interview-prep')->middleware(['throttle:write', 'throttle:ai']);

    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index')->middleware('throttle:read');
    Route::patch('settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update')->middleware('throttle:write');
    Route::patch('settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme.update')->middleware('throttle:write');
    Route::patch('settings/color-theme', [SettingsController::class, 'updateColorTheme'])->name('settings.color-theme.update')->middleware('throttle:write');
    Route::patch('settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update')->middleware('throttle:write');
    Route::patch('settings/tax', [SettingsController::class, 'updateTaxSettings'])->name('settings.tax.update')->middleware('throttle:write');

    Route::get('templates', [ApplicationTemplateController::class, 'index'])->name('templates.index')->middleware('throttle:read');
    Route::post('templates', [ApplicationTemplateController::class, 'store'])->name('templates.store')->middleware('throttle:write');
    Route::match(['put', 'patch'], 'templates/{applicationTemplate}', [ApplicationTemplateController::class, 'update'])->name('templates.update')->middleware('throttle:update');
    Route::delete('templates/{applicationTemplate}', [ApplicationTemplateController::class, 'destroy'])->name('templates.destroy')->middleware('throttle:delete');

    Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index')->middleware('throttle:read');
    Route::post('contacts', [ContactController::class, 'store'])->name('contacts.store')->middleware('throttle:write');
    Route::match(['put', 'patch'], 'contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update')->middleware('throttle:update');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy')->middleware('throttle:delete');
    Route::post('contacts/{contact}/link', [ContactController::class, 'link'])->name('contacts.link')->middleware('throttle:update');
    Route::post('contacts/{contact}/unlink', [ContactController::class, 'unlink'])->name('contacts.unlink')->middleware('throttle:delete');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index')->middleware('throttle:read');
    Route::put('documents/profile', [DocumentController::class, 'updateProfile'])->name('documents.profile.update')->middleware('throttle:write');
    Route::post('documents/cover-letter', [DocumentController::class, 'coverLetter'])->middleware(['throttle:write', 'throttle:ai'])->name('documents.cover-letter');
    Route::post('documents/ai-polish-resume', [DocumentController::class, 'aiPolishResume'])->middleware(['throttle:write', 'throttle:ai'])->name('documents.ai-polish-resume');
    Route::post('documents/ai-improve-cover-letter', [DocumentController::class, 'aiImproveCoverLetter'])->middleware(['throttle:write', 'throttle:ai'])->name('documents.ai-improve-cover-letter');
    Route::get('documents/saved', [DocumentController::class, 'saved'])->name('documents.saved')->middleware('throttle:read');
    Route::get('documents/saved-cover-letters', [DocumentController::class, 'savedCoverLettersJson'])->name('documents.saved-cover-letters')->middleware('throttle:read');
    Route::get('documents/saved-resumes', [DocumentController::class, 'savedResumesJson'])->name('documents.saved-resumes')->middleware('throttle:read');
    Route::post('documents/save-resume', [DocumentController::class, 'saveResume'])->name('documents.save-resume')->middleware('throttle:write');
    Route::post('documents/save-cover-letter', [DocumentController::class, 'saveCoverLetter'])->name('documents.save-cover-letter')->middleware('throttle:write');
    Route::delete('documents/resume-versions/{savedResume}', [DocumentController::class, 'destroyResumeVersion'])->name('documents.resume-versions.destroy')->middleware('throttle:delete');
    Route::delete('documents/cover-letters/{savedCoverLetter}', [DocumentController::class, 'destroyCoverLetter'])->name('documents.cover-letters.destroy')->middleware('throttle:delete');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', App\Http\Controllers\Admin\DashboardController::class)->name('dashboard')->middleware('throttle:read');
    Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('throttle:read');
    Route::post('users/{user}/toggle-role', [UserController::class, 'toggleRole'])->name('users.toggle-role')->middleware('throttle:write');
    Route::post('users/{user}/toggle-ai', [UserController::class, 'toggleAi'])->name('users.toggle-ai')->middleware('throttle:write');
    Route::post('users/{user}/ai-limit', [UserController::class, 'setAiLimit'])->name('users.ai-limit')->middleware('throttle:write');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('throttle:delete');
    Route::get('ai-usage', AiUsageController::class)->name('ai-usage')->middleware('throttle:read');
    Route::get('legal-documents', [LegalDocumentController::class, 'index'])->name('legal-documents.index')->middleware('throttle:read');
    Route::put('legal-documents/{legalDocument}', [LegalDocumentController::class, 'update'])->name('legal-documents.update')->middleware('throttle:write');
});
