<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiResponseCache;
use App\Models\JobApplication;
use App\Models\SavedResume;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('admin/dashboard/index', [
            'total_users' => fn () => User::count(),
            'active_job_applications' => fn () => JobApplication::whereIn('status', ['applied', 'interviewing', 'offer'])->count(),
            'total_resumes' => fn () => SavedResume::count(),
            'daily_ai_api_calls' => fn () => AiResponseCache::whereDate('created_at', today())->count(),
        ]);
    }
}
