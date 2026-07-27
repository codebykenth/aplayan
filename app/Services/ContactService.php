<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Collection;

class ContactService
{
    public function listForUser(User $user): Collection
    {
        return $user->contacts()->latest()->get();
    }

    public function createForUser(User $user, array $data): Contact
    {
        return $user->contacts()->create($data);
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
    }

    public function unlinkFromApplication(Contact $contact, JobApplication $jobApplication): void
    {
        $contact->jobApplications()->detach($jobApplication->id);
    }
}
