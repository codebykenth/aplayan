<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureErrorPages();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );

        RateLimiter::for('read', function (Request $request) {
            $key = 'read:'.($request->user()?->id ?? $request->ip());

            return Limit::perMinute(120)->by($key);
        });

        RateLimiter::for('write', function (Request $request) {
            $key = 'write:'.($request->user()?->id ?? $request->ip());

            return Limit::perMinute(30)->by($key);
        });

        RateLimiter::for('update', function (Request $request) {
            $key = 'update:'.($request->user()?->id ?? $request->ip());

            return Limit::perMinute(30)->by($key);
        });

        RateLimiter::for('delete', function (Request $request) {
            $key = 'delete:'.($request->user()?->id ?? $request->ip());

            return Limit::perMinute(20)->by($key);
        });

        RateLimiter::for('ai', function (Request $request) {
            if (! app()->isProduction()) {
                return Limit::none();
            }

            $user = $request->user();
            $key = 'ai:'.($user ? $user->id : $request->ip());

            return Limit::perDay(500)->by($key);
        });

        RateLimiter::for('ai-uncached', function (Request $request) {
            if (! app()->isProduction()) {
                return Limit::none();
            }

            $user = $request->user();
            $key = 'ai-uncached:'.($user ? $user->id : $request->ip());

            return Limit::perDay(500)->by($key);
        });
    }

    protected function configureErrorPages(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
            $status = $response->statusCode();

            $codes = [400, 401, 403, 404, 405, 419, 429, 500, 502, 503];

            if (! in_array($status, $codes)) {
                return null;
            }

            return $response->render('ErrorPage', ['status' => $status])->withSharedData();
        });
    }
}
