<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class TurnstileVerifyService
{
    private const string VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    private const int TIMEOUT = 10;

    public function verify(string $token): bool
    {
        try {
            $response = $this->client()
                ->asForm()
                ->post(self::VERIFY_URL, [
                    'secret' => config('services.turnstile.secret'),
                    'response' => $token,
                ])
                ->throw()
                ->json();

            return $response['success'] ?? false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function client(): PendingRequest
    {
        return Http::timeout(self::TIMEOUT);
    }
}
