<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class JobApplicationExportController extends Controller
{
    public function __construct(private JobApplicationService $service) {}

    public function __invoke(Request $request): Response
    {
        $this->authorize('viewAny', JobApplication::class);

        $format = $request->query('format', 'csv');

        $applications = $this->service->listForUser($request->user());

        if ($format === 'json') {
            $json = json_encode(
                JobApplicationResource::collection($applications)->jsonSerialize(),
                JSON_THROW_ON_ERROR,
            );

            return response()->make($json, Response::HTTP_OK, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="job-applications.json"',
            ]);
        }

        $csv = $this->buildCsv($applications);

        return response()->make($csv, Response::HTTP_OK, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="job-applications.csv"',
        ]);
    }

    private function buildCsv(iterable $applications): string
    {
        $handle = fopen('php://memory', 'r+');

        fputcsv($handle, ['company_name', 'job_title', 'status', 'location', 'expected_salary', 'date_applied']);

        foreach ($applications as $app) {
            fputcsv($handle, [
                $app->company_name,
                $app->job_title,
                $app->status,
                $app->location,
                $app->expected_salary ?? '',
                $app->date_applied?->toDateString() ?? '',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }
}
