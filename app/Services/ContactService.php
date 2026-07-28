<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ContactService
{
    public function listForUser(User $user): Collection
    {
        return $user->contacts()->latest()->get();
    }

    public function createForUser(User $user, array $data): Contact
    {
        $applicationId = $data['job_application_id'] ?? null;
        unset($data['job_application_id']);

        $contact = $user->contacts()->create($data);

        if ($applicationId) {
            $application = $user->jobApplications()->find($applicationId);
            if ($application) {
                $this->linkToApplication($contact, $application);
            }
        }

        return $contact;
    }

    public function updateForUser(Contact $contact, array $data): Contact
    {
        $contact->update($data);

        return $contact;
    }

    public function deleteForUser(Contact $contact): void
    {
        $contact->delete();
    }

    public function linkToApplication(Contact $contact, JobApplication $jobApplication): void
    {
        $contact->jobApplications()->syncWithoutDetaching($jobApplication->id);
        $jobApplication->update(['last_contacted_at' => now()]);
    }

    public function unlinkFromApplication(Contact $contact, JobApplication $jobApplication): void
    {
        $contact->jobApplications()->detach($jobApplication->id);
    }
}
