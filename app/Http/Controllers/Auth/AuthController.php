<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TurnstileVerifyService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        private TurnstileVerifyService $turnstile,
    ) {}

    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'turnstile_site_key' => config('services.turnstile.site_key'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'turnstile' => ['required', 'string'],
        ]);

        if (!$this->turnstile->verify($data['turnstile'])) {
            return back()->withErrors([
                'security_check_failed' => 'Please complete the security check, then try again.',
            ]);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('job-applications.index', absolute: false));
    }

    public function login(): Response
    {
        return Inertia::render('auth/login', [
            'turnstile_site_key' => config('services.turnstile.site_key'),
        ]);
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'turnstile' => ['required', 'string'],
        ]);

        if (!$this->turnstile->verify($data['turnstile'])) {
            return back()->withErrors([
                'security_check_failed' => 'Please complete the security check, then try again.',
            ]);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard', absolute: false));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
