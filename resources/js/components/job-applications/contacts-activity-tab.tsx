import { router } from '@inertiajs/react';
import {
    UsersIcon,
    LinkIcon,
    ClockIcon,
    LoaderIcon,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { ActivityTimeline } from '@/components/job-applications/activity-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { link as linkContactRoute } from '@/routes/contacts';
import type { Contact } from '@/types/contact';
import type { JobApplication } from '@/types/job-application';

interface ContactsActivityTabProps {
    application: JobApplication;
    availableContacts?: Contact[];
    onApplicationUpdate?: (application: JobApplication) => void;
}

export default function ContactsActivityTab({
    application,
    availableContacts = [],
}: ContactsActivityTabProps) {
    const [contacting, setContacting] = useState(false);
    const [createContactOpen, setCreateContactOpen] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');
    const [newContactRole, setNewContactRole] = useState('');
    const [creatingContact, setCreatingContact] = useState(false);
    const [localContacts, setLocalContacts] = useState(application.contacts ?? []);

    const handleMarkAsContacted = useCallback(async (dateVal: string | null = 'now') => {
        setContacting(true);

        try {
            const response = await fetch(
                `/job-applications/${application.id}/mark-as-contacted`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({ date: dateVal }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to mark as contacted.');
            }

            const result = await response.json();
            router.reload();
        } catch (error) {
        } finally {
            setContacting(false);
        }
    }, [application.id]);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Contacts
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setCreateContactOpen(true)}
                    >
                        + Create Contact
                    </Button>
                </div>
                {localContacts.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {localContacts.map((contact: Pick<Contact, 'id' | 'name' | 'email' | 'phone' | 'company_name' | 'role'>) => (
                            <Badge
                                key={contact.id}
                                variant="secondary"
                                className="gap-1 text-xs"
                            >
                                <UsersIcon className="size-2.5" />
                                {contact.name}
                                {contact.role && (
                                    <span className="text-muted-foreground">
                                        ({contact.role})
                                    </span>
                                )}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground italic">
                        No contacts linked
                    </p>
                )}
                {availableContacts.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground">
                            Link a contact:
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {availableContacts
                                .filter(
                                    (c) =>
                                        !localContacts.some(
                                            (ec: Pick<Contact, 'id' | 'name' | 'email' | 'phone' | 'company_name' | 'role'>) => ec.id === c.id,
                                        ),
                                )
                                .map((contact) => (
                                    <Button
                                        key={contact.id}
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                            setLocalContacts((prev) => [...prev, contact]);
                                            router.post(
                                                linkContactRoute.url(contact.id),
                                                {
                                                    job_application_id: application.id,
                                                },
                                                { preserveState: true },
                                            );
                                        }}
                                    >
                                        <LinkIcon className="size-2.5" />
                                        {contact.name}
                                    </Button>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Last Contacted
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Button
                            onClick={() => handleMarkAsContacted('now')}
                            disabled={contacting}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                        >
                            {contacting ? (
                                <LoaderIcon className="size-3 animate-spin" />
                            ) : (
                                <>
                                    <ClockIcon className="size-3" />
                                    Today
                                </>
                            )}
                        </Button>
                        {application.last_contacted_at && (
                            <Button
                                onClick={() => handleMarkAsContacted(null)}
                                disabled={contacting}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={application.last_contacted_at ? application.last_contacted_at.split('T')[0] : ''}
                        onChange={(e) => handleMarkAsContacted(e.target.value || null)}
                        disabled={contacting}
                        className="h-8 text-xs"
                    />
                </div>
            </div>

            {application.activities && application.activities.length > 0 && (
                <ActivityTimeline activities={application.activities} />
            )}

            {createContactOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-popover p-4 shadow-lg">
                        <h3 className="text-base font-medium mb-4">Quick Create Contact</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (!newContactName.trim()) {
return;
}

                                setCreatingContact(true);

                                router.post(
                                    '/contacts',
                                    {
                                        name: newContactName,
                                        email: newContactEmail || null,
                                        role: newContactRole || null,
                                        company_name: application.company_name,
                                        job_application_id: application.id,
                                    },
                                    {
                                        preserveState: true,
                                        onSuccess: () => {
                                            setNewContactName('');
                                            setNewContactEmail('');
                                            setNewContactRole('');
                                            setCreateContactOpen(false);
                                        },
                                        onFinish: () => setCreatingContact(false),
                                    },
                                );
                            }}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium">
                                    Name *
                                </label>
                                <Input
                                    value={newContactName}
                                    onChange={(e) => setNewContactName(e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium">
                                    Role / Title
                                </label>
                                <Input
                                    value={newContactRole}
                                    onChange={(e) => setNewContactRole(e.target.value)}
                                    placeholder="e.g. Senior Recruiter"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={newContactEmail}
                                    onChange={(e) => setNewContactEmail(e.target.value)}
                                    placeholder="jane@company.com"
                                />
                            </div>

                            <div className="mt-2 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateContactOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creatingContact || !newContactName.trim()}>
                                    {creatingContact ? (
                                        <>
                                            <LoaderIcon className="size-3 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Contact'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
