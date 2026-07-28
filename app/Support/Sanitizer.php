<?php

namespace App\Support;

class Sanitizer
{
    public static function stripTags(string $value): string
    {
        return strip_tags($value);
    }

    public static function sanitizeArray(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = trim(self::stripTags($value));
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitizeArray($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
