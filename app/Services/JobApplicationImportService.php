<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class JobApplicationImportService
{
    public function __construct(private JobApplicationService $jobApplicationService) {}

    public function import(User $user, UploadedFile $file): array
    {
        $content = file_get_contents($file->getRealPath());
        $trimmed = ltrim($content ?: '');

        if (str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{')) {
            $rows = $this->parseJson($file);
        } else {
            $rows = $this->parseCsv($file);
        }

        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $data = $this->mapRow($row);

            if ($this->isValid($data)) {
                $this->jobApplicationService->createForUser($user, $data);
                $imported++;
            } else {
                $skipped++;
            }
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    private function parseCsv(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return [];
        }

        $headers = fgetcsv($handle);

        if ($headers === false) {
            fclose($handle);

            return [];
        }

        if (isset($headers[0]) && str_starts_with($headers[0], "\xEF\xBB\xBF")) {
            $headers[0] = substr($headers[0], 3);
        }

        $headers = array_map('trim', $headers);

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === 1 && $row[0] === '') {
                continue;
            }
            if (count($row) !== count($headers)) {
                continue;
            }
            $rows[] = array_combine($headers, $row);
        }

        fclose($handle);

        return $rows;
    }

    private function parseJson(UploadedFile $file): array
    {
        $content = file_get_contents($file->getRealPath());

        if ($content === false) {
            return [];
        }

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($data)) {
            return [];
        }

        return $data;
    }

    private function mapRow(array $row): array
    {
        return [
            'company_name' => $row['company_name'] ?? null,
            'job_title' => $row['job_title'] ?? null,
            'status' => $row['status'] ?? 'wishlist',
            'location' => $row['location'] ?? 'Remote',
            'expected_salary' => isset($row['expected_salary']) && $row['expected_salary'] !== '' ? (int) $row['expected_salary'] : null,
            'date_applied' => isset($row['date_applied']) && $row['date_applied'] !== '' ? $row['date_applied'] : null,
            'job_url' => $row['job_url'] ?? null,
            'job_description' => $row['job_description'] ?? null,
            'notes' => $row['notes'] ?? null,
        ];
    }

    private function isValid(array $data): bool
    {
        $validator = Validator::make($data, [
            'company_name' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:wishlist,applied,interviewing,offer,rejected,withdrawn'],
            'location' => ['required', 'string', 'max:255'],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'date_applied' => ['nullable', 'date'],
            'job_url' => ['nullable', 'url', 'max:255'],
            'job_description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        return ! $validator->fails();
    }
}
