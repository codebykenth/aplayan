<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGoalRequest;
use App\Services\GoalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function __construct(
        private GoalService $goalService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('goals/index', $this->goalService->forUser($user));
    }

    public function update(UpdateGoalRequest $request)
    {
        $user = $request->user();
        $user->update(['weekly_goal' => $request->input('weekly_goal')]);

        return back()->with('status', 'Weekly goal updated successfully.');
    }
}
