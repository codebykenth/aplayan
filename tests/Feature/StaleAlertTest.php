<?php

use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\JobApplicationService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->service = app(JobApplicationService::class);
});

describe('staleness computation', function () {
    it('returns null for wishlist status', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'wishlist',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(20)]);

        expect($this->service->stalenessLevel($app->fresh()))->toBeNull();
    });

    it('returns null for applied status within warning threshold', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(3)]);

        expect($this->service->stalenessLevel($app->fresh()))->toBeNull();
    });

    it('returns warning for applied status at 7 days', function () {
        $sevenDaysAgo = now()->subDays(7);
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
            'updated_at' => $sevenDaysAgo,
        ]);

        expect($this->service->daysSinceLastUpdate($app->fresh()))->toBeGreaterThanOrEqual(7);
        expect($this->service->stalenessLevel($app->fresh()))->toBe('warning');
    });

    it('returns warning for interviewing status within alert threshold', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'interviewing',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(10)]);

        expect($this->service->stalenessLevel($app->fresh()))->toBe('warning');
    });

    it('returns alert for applied status at 14 days', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(14)]);

        expect($this->service->stalenessLevel($app->fresh()))->toBe('alert');
    });

    it('returns alert for interviewing status past 14 days', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'interviewing',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(20)]);

        expect($this->service->stalenessLevel($app->fresh()))->toBe('alert');
    });

    it('uses last_contacted_at over updated_at when available', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
            'updated_at' => now()->subDays(20),
            'last_contacted_at' => now()->subDays(3),
        ]);

        expect($this->service->stalenessLevel($app))->toBeNull();
        expect($this->service->daysSinceLastUpdate($app))->toBeLessThan(7);
    });

    it('returns 0 days when no reference dates exist', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
        ]);
        $app->forceFill(['updated_at' => null, 'last_contacted_at' => null])->saveQuietly();

        expect($this->service->daysSinceLastUpdate($app->fresh()))->toBe(0);
    });
});

describe('JobApplicationResource exposes staleness fields', function () {
    it('includes staleness_level and days_since_update in resource output', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(10)]);

        $resource = JobApplicationResource::make($app->fresh());
        $data = $resource->toArray(request());

        expect($data)->toHaveKey('staleness_level');
        expect($data)->toHaveKey('days_since_update');
        expect($data)->toHaveKey('last_contacted_at');
        expect($data['staleness_level'])->toBe('warning');
        expect($data['days_since_update'])->toBeGreaterThanOrEqual(10);
    });

    it('returns null staleness_level for non-stale statuses', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'offer',
        ]);
        JobApplication::where('id', $app->id)->update(['updated_at' => now()->subDays(30)]);

        $resource = JobApplicationResource::make($app->fresh());
        $data = $resource->toArray(request());

        expect($data['staleness_level'])->toBeNull();
    });
});

describe('mark as contacted', function () {
    it('updates last_contacted_at on the application', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
            'last_contacted_at' => null,
        ]);

        $result = $this->service->markAsContacted($app);

        expect($result->last_contacted_at)->not->toBeNull();
        expect($result->fresh()->last_contacted_at)->not->toBeNull();
    });

    it('creates a contacted activity record', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
        ]);

        $this->service->markAsContacted($app);

        expect($app->fresh()->activities()->where('type', 'contacted')->count())->toBe(1);
    });

    it('resets the staleness clock', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'applied',
            'updated_at' => now()->subDays(20),
            'last_contacted_at' => null,
        ]);

        $this->service->markAsContacted($app);

        expect($this->service->stalenessLevel($app->fresh()))->toBeNull();
    });
});

describe('follow-up draft endpoint', function () {
    it('redirects unauthenticated users to login', function () {
        $app = JobApplication::factory()->create(['user_id' => $this->user->id]);

        $this->post(route('job-applications.follow-up-draft', $app))->assertRedirect();
    });

    it('returns 403 for another users application', function () {
        $app = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->postJson(route('job-applications.follow-up-draft', $app))
            ->assertForbidden();
    });

    it('returns a follow-up draft', function () {
        Http::preventStrayRequests();

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Dear Hiring Manager, I hope this message finds you well. I wanted to follow up on my application for the Senior Developer position at Acme Corp.'],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Senior Developer',
            'status' => 'applied',
            'last_contacted_at' => now()->subDays(10),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('job-applications.follow-up-draft', $app));

        $response->assertSuccessful();
        expect($response->json('draft'))->toBeString();
        expect($response->json('draft'))->toContain('Acme Corp');
    });
});

describe('mark-as-contacted endpoint', function () {
    it('redirects unauthenticated users to login', function () {
        $app = JobApplication::factory()->create();

        $this->post(route('job-applications.mark-as-contacted', $app))->assertRedirect();
    });

    it('returns 403 for another users application', function () {
        $app = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->postJson(route('job-applications.mark-as-contacted', $app))
            ->assertForbidden();
    });

    it('updates last_contacted_at', function () {
        $app = JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'last_contacted_at' => null,
        ]);

        $this->actingAs($this->user)
            ->postJson(route('job-applications.mark-as-contacted', $app))
            ->assertSuccessful();

        expect($app->fresh()->last_contacted_at)->not->toBeNull();
    });
});
