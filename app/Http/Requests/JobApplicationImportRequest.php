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
                'mimes:csv,txt,json',
                'mimetypes:text/csv,text/plain,application/json,text/json',
                function ($attribute, $value, $fail): void {
                    if (! $value) {
                        return;
                    }

                    $content = file_get_contents($value->getRealPath());
                    $trimmed = ltrim($content ?: '');

                    if (str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{')) {
                        $this->validateJsonFile($value, $fail);
                    } else {
                        $this->validateCsvFile($value, $fail);
                    }
                },
            ],
        ];
    }

    private function validateCsvFile(UploadedFile $file, callable $fail): void
    {
        $headers = $this->getCsvHeaders($file);
        $required = ['company_name', 'job_title'];
        $missing = array_diff($required, $headers);

        if (! empty($missing)) {
            $fail('The CSV file is missing required headers: '.implode(', ', $missing));
        }
    }

    private function validateJsonFile(UploadedFile $file, callable $fail): void
    {
        $content = file_get_contents($file->getRealPath());

        if ($content === false) {
            $fail('Unable to read the JSON file.');

            return;
        }

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $fail('Invalid JSON syntax: '.json_last_error_msg());

            return;
        }

        if (! is_array($data)) {
            $fail('JSON must contain an array of application objects.');

            return;
        }

        foreach ($data as $index => $item) {
            if (! is_array($item)) {
                $fail("Item at index {$index} must be an object.");

                return;
            }

            $required = ['company_name', 'job_title'];
            $missing = array_diff($required, array_keys($item));

            if (! empty($missing)) {
                $fail("Item at index {$index} is missing required fields: ".implode(', ', $missing));

                return;
            }
        }
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
