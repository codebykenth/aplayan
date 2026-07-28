<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FxExchangeService
{
    private const string API_URL = 'https://open.er-api.com/v6/latest/';

    private const int CACHE_TTL = 86400;

    private const array SUPPORTED_CURRENCIES = [
        'PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'AED', 'NZD',
    ];

    private const array FALLBACK_RATES = [
        'PHP' => [
            'USD' => 0.0178,
            'EUR' => 0.0164,
            'GBP' => 0.0141,
            'AUD' => 0.0272,
            'CAD' => 0.0244,
            'SGD' => 0.0239,
            'JPY' => 2.68,
            'AED' => 0.0654,
            'NZD' => 0.0295,
        ],
        'USD' => [
            'PHP' => 56.25,
            'EUR' => 0.922,
            'GBP' => 0.792,
            'AUD' => 1.528,
            'CAD' => 1.372,
            'SGD' => 1.344,
            'JPY' => 150.5,
            'AED' => 3.675,
            'NZD' => 1.658,
        ],
        'EUR' => [
            'PHP' => 61.0,
            'USD' => 1.085,
            'GBP' => 0.859,
            'AUD' => 1.658,
            'CAD' => 1.489,
            'SGD' => 1.458,
            'JPY' => 163.2,
            'AED' => 3.988,
            'NZD' => 1.799,
        ],
        'GBP' => [
            'PHP' => 71.0,
            'USD' => 1.263,
            'EUR' => 1.164,
            'AUD' => 1.931,
            'CAD' => 1.734,
            'SGD' => 1.698,
            'JPY' => 189.9,
            'AED' => 4.643,
            'NZD' => 2.095,
        ],
        'AUD' => [
            'PHP' => 36.75,
            'USD' => 0.655,
            'EUR' => 0.603,
            'GBP' => 0.518,
            'CAD' => 0.898,
            'SGD' => 0.879,
            'JPY' => 98.3,
            'AED' => 2.403,
            'NZD' => 1.084,
        ],
        'CAD' => [
            'PHP' => 40.95,
            'USD' => 0.729,
            'EUR' => 0.672,
            'GBP' => 0.577,
            'AUD' => 1.114,
            'SGD' => 0.979,
            'JPY' => 109.5,
            'AED' => 2.676,
            'NZD' => 1.208,
        ],
        'SGD' => [
            'PHP' => 41.85,
            'USD' => 0.744,
            'EUR' => 0.686,
            'GBP' => 0.589,
            'AUD' => 1.138,
            'CAD' => 1.021,
            'JPY' => 111.9,
            'AED' => 2.734,
            'NZD' => 1.234,
        ],
        'JPY' => [
            'PHP' => 0.373,
            'USD' => 0.00665,
            'EUR' => 0.00613,
            'GBP' => 0.00527,
            'AUD' => 0.01018,
            'CAD' => 0.00913,
            'SGD' => 0.00894,
            'AED' => 0.02442,
            'NZD' => 0.01102,
        ],
        'AED' => [
            'PHP' => 15.3,
            'USD' => 0.272,
            'EUR' => 0.251,
            'GBP' => 0.215,
            'AUD' => 0.416,
            'CAD' => 0.374,
            'SGD' => 0.366,
            'JPY' => 40.95,
            'NZD' => 0.451,
        ],
        'NZD' => [
            'PHP' => 33.9,
            'USD' => 0.603,
            'EUR' => 0.556,
            'GBP' => 0.477,
            'AUD' => 0.923,
            'CAD' => 0.828,
            'SGD' => 0.81,
            'JPY' => 90.7,
            'AED' => 2.217,
        ],
    ];

    public function getRates(string $baseCurrency): array
    {
        $baseCurrency = strtoupper($baseCurrency);

        if (! in_array($baseCurrency, self::SUPPORTED_CURRENCIES)) {
            $baseCurrency = 'PHP';
        }

        return Cache::remember(
            "fx_rates_{$baseCurrency}",
            self::CACHE_TTL,
            fn () => $this->fetchRates($baseCurrency),
        );
    }

    public function convert(float $amount, string $fromCurrency, string $toCurrency): float
    {
        $fromCurrency = strtoupper($fromCurrency);
        $toCurrency = strtoupper($toCurrency);

        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        $rates = $this->getRates($fromCurrency);

        if (isset($rates[$toCurrency])) {
            return round($amount * $rates[$toCurrency], 2);
        }

        return $amount;
    }

    public function convertToPhp(float $amount, string $fromCurrency): float
    {
        return $this->convert($amount, $fromCurrency, 'PHP');
    }

    public function getSupportedCurrencies(): array
    {
        return self::SUPPORTED_CURRENCIES;
    }

    public function getCurrencySymbol(string $currency): string
    {
        return match (strtoupper($currency)) {
            'PHP' => '₱',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'AUD' => 'A$',
            'CAD' => 'C$',
            'SGD' => 'S$',
            'JPY' => '¥',
            'AED' => 'AED',
            'NZD' => 'NZ$',
            default => $currency,
        };
    }

    private function fetchRates(string $baseCurrency): array
    {
        try {
            $response = Http::timeout(5)->get(self::API_URL.$baseCurrency);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rates']) && is_array($data['rates'])) {
                    return collect($data['rates'])
                        ->filter(fn ($rate, $code) => in_array(strtoupper($code), self::SUPPORTED_CURRENCIES))
                        ->mapWithKeys(fn ($rate, $code) => [strtoupper($code) => (float) $rate])
                        ->toArray();
                }
            }
        } catch (\Exception $e) {
            Log::warning('FX API request failed, using fallback rates', [
                'base_currency' => $baseCurrency,
                'error' => $e->getMessage(),
            ]);
        }

        return self::FALLBACK_RATES[$baseCurrency] ?? self::FALLBACK_RATES['PHP'];
    }
}
