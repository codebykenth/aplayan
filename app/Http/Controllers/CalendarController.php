<?php

namespace App\Http\Controllers;

use App\Services\CalendarService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        private CalendarService $calendarService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);

        [$startDate, $endDate] = $this->calendarService->getMonthRange($month, $year);

        $events = $this->calendarService->eventsForUser(auth()->user(), $startDate, $endDate);

        return Inertia::render('calendar/index', [
            'events' => $events,
            'month' => $month,
            'year' => $year,
        ]);
    }
}