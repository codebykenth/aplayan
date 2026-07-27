<?php

namespace App\Http\Controllers;

use App\Http\Requests\LinkContactRequest;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use App\Models\JobApplication;
use App\Services\ContactService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(private ContactService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Contact::class);

        $contacts = $this->service->listForUser($request->user())->load('jobApplications');
        $applications = $request->user()->jobApplications()->get();

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'applications' => $applications,
        ]);
    }

    public function store(StoreContactRequest $request): RedirectResponse
    {
        $this->authorize('create', Contact::class);

        $this->service->createForUser($request->user(), $request->validated());

        return to_route('contacts.index');
    }

    public function update(UpdateContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $this->service->updateForUser($contact, $request->validated());

        return to_route('contacts.index');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $this->service->deleteForUser($contact);

        return to_route('contacts.index');
    }

    public function link(LinkContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $jobApplication = JobApplication::findOrFail($request->validated('job_application_id'));

        if ($jobApplication->user_id !== $request->user()->id) {
            abort(403);
        }

        $this->service->linkToApplication($contact, $jobApplication);

        return back();
    }

    public function unlink(LinkContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $jobApplication = JobApplication::findOrFail($request->validated('job_application_id'));

        $this->service->unlinkFromApplication($contact, $jobApplication);

        return back();
    }
}
