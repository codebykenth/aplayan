<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class JobApplicationImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:csv,txt',
                function ($attribute, $value, $fail): void {
                    if (! $value) {
                        return;
                    }

                    $headers = $this->getCsvHeaders($value);
                    $required = ['company_name', 'job_title', 'status', 'location', 'expected_salary', 'date_applied'];
                    $missing = array_diff($required, $headers);

                    if (! empty($missing)) {
                        $fail('The CSV file is missing required headers: '.implode(', ', $missing));
                    }
                },
            ],
        ];
    }

    private function getCsvHeaders(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return [];
        }

        $headers = fgetcsv($handle);
        fclose($handle);

        if ($headers === false) {
            return [];
        }

        if (isset($headers[0]) && str_starts_with($headers[0], "\xEF\xBB\xBF")) {
            $headers[0] = substr($headers[0], 3);
        }

        return array_map('trim', $headers);
    }
}
