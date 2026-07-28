import { Head, router, useForm } from '@inertiajs/react';
import {
    SearchIcon,
    PlusIcon,
    Trash2Icon,
    PencilIcon,
    UsersIcon,
    MailIcon,
    PhoneIcon,
    BuildingIcon,
    BriefcaseIcon,
    ClockIcon,
    LinkIcon,
    UnlinkIcon,
} from 'lucide-react';
import { useState, useMemo  } from 'react';
import type {ReactNode} from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDestructiveDialog } from '@/components/ui/confirm-destructive-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    store as storeContact,
    update as updateContact,
    destroy as deleteContact,
    link as linkContact,
    unlink as unlinkContact,
} from '@/routes/contacts';
import type { Contact } from '@/types/contact';
import type { JobApplication } from '@/types/job-application';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    role: string;
    notes: string;
    last_contacted_at: string;
}

function formatLastContacted(date: string | null): string | null {
    if (!date) {
return null;
}

    const d = new Date(date);

    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function ContactCard({
    contact,
    applications,
    onEdit,
    onDelete,
}: {
    contact: Contact;
    applications: JobApplication[];
    onEdit: (contact: Contact) => void;
    onDelete: (contact: Contact) => void;
}) {
    const [linking, setLinking] = useState(false);
    const [unlinking, setUnlinking] = useState<number | null>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);

    const linkedApps = applications.filter(
        (app) => contact.job_application_ids?.includes(app.id),
    );

    const availableApps = applications.filter(
        (app) => !contact.job_application_ids?.includes(app.id),
    );

    function handleLink(appId: number) {
        setLinking(true);
        router.post(
            linkContact.url(contact.id),
            { job_application_id: appId },
            {
                preserveState: true,
                onFinish: () => setLinking(false),
                onSuccess: () => setLinkDialogOpen(false),
            },
        );
    }

    function handleUnlink(appId: number) {
        setUnlinking(appId);
        router.post(
            unlinkContact.url(contact.id),
            { job_application_id: appId },
            { preserveState: true, onFinish: () => setUnlinking(null) },
        );
    }

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                        {contact.name}
                    </h3>
                    {contact.role && contact.company_name && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BriefcaseIcon className="size-3 shrink-0" />
                            {contact.role} at {contact.company_name}
                        </p>
                    )}
                    {!contact.role && contact.company_name && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BuildingIcon className="size-3 shrink-0" />
                            {contact.company_name}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(contact)}
                        aria-label="Edit contact"
                    >
                        <PencilIcon className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(contact)}
                        aria-label="Delete contact"
                    >
                        <Trash2Icon className="size-3.5 text-destructive" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {contact.email && (
                    <p className="flex items-center gap-1">
                        <MailIcon className="size-3 shrink-0" />
                        {contact.email}
                    </p>
                )}
                {contact.phone && (
                    <p className="flex items-center gap-1">
                        <PhoneIcon className="size-3 shrink-0" />
                        {contact.phone}
                    </p>
                )}
                {contact.last_contacted_at && (
                    <p className="flex items-center gap-1">
                        <ClockIcon className="size-3 shrink-0" />
                        Last contact: {formatLastContacted(contact.last_contacted_at)}
                    </p>
                )}
            </div>

            {contact.notes && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {contact.notes}
                </p>
            )}

            <div className="flex flex-col gap-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Linked Applications ({linkedApps.length})
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setLinkDialogOpen(true)}
                        disabled={availableApps.length === 0}
                    >
                        <LinkIcon className="size-3" />
                        Link
                    </Button>
                </div>
                {linkedApps.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {linkedApps.map((app) => (
                            <Badge
                                key={app.id}
                                variant="secondary"
                                className="gap-1 text-xs"
                            >
                                {app.job_title} @ {app.company_name}
                                <button
                                    type="button"
                                    onClick={() => handleUnlink(app.id)}
                                    disabled={unlinking === app.id}
                                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                                    aria-label={`Unlink from ${app.job_title}`}
                                >
                                    <UnlinkIcon className="size-2.5" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground italic">
                        No linked applications
                    </p>
                )}
            </div>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Link to Application</DialogTitle>
                        <DialogDescription>
                            Select a job application to link with {contact.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {availableApps.map((app) => (
                            <button
                                key={app.id}
                                type="button"
                                onClick={() => handleLink(app.id)}
                                disabled={linking}
                                className="flex items-center justify-between rounded-lg border border-border p-3 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{app.job_title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {app.company_name}
                                    </span>
                                </div>
                                <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ContactsIndex({
    contacts,
    applications = [],
}: {
    contacts: Contact[];
    applications?: JobApplication[];
}) {
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<ContactFormData>({
            name: '',
            email: '',
            phone: '',
            company_name: '',
            role: '',
            notes: '',
            last_contacted_at: '',
        });

    const filtered = useMemo(() => {
        if (!search) {
return contacts;
}

        const q = search.toLowerCase();

        return contacts.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.company_name?.toLowerCase().includes(q) ||
                c.role?.toLowerCase().includes(q),
        );
    }, [contacts, search]);

    function openCreate() {
        setEditingContact(null);
        reset();
        clearErrors();
        setFormOpen(true);
    }

    function openEdit(contact: Contact) {
        setEditingContact(contact);
        setData({
            name: contact.name,
            email: contact.email ?? '',
            phone: contact.phone ?? '',
            company_name: contact.company_name ?? '',
            role: contact.role ?? '',
            notes: contact.notes ?? '',
            last_contacted_at: contact.last_contacted_at
                ? new Date(contact.last_contacted_at).toISOString().split('T')[0]
                : '',
        });
        clearErrors();
        setFormOpen(true);
    }

    function handleClose() {
        reset();
        clearErrors();
        setFormOpen(false);
        setEditingContact(null);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            ...data,
            email: data.email || undefined,
            phone: data.phone || undefined,
            company_name: data.company_name || undefined,
            role: data.role || undefined,
            notes: data.notes || undefined,
            last_contacted_at: data.last_contacted_at || undefined,
        };

        if (editingContact) {
            put(updateContact.url(editingContact.id), {
                onSuccess: () => handleClose(),
            });
        } else {
            post(storeContact.url(), {
                onSuccess: () => handleClose(),
            });
        }
    }

    function handleDelete(contact: Contact) {
        setDeletingContact(contact);
    }

    return (
        <>
            <Head title="Contacts" />

            <div className="flex flex-1 min-h-0 flex-col gap-6">
                <PageHeader title="Contacts" description="Manage your professional network, recruiters, and hiring managers">
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        New Contact
                    </Button>
                </PageHeader>

                <div className="relative w-full max-w-xs shrink-0">
                    <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-8"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {contacts.length === 0 ? (
                    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-2 py-16 text-center">
                        <UsersIcon className="size-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No contacts yet. Add recruiters, HR managers, or interviewers
                            to keep track of your professional network.
                        </p>
                        <Button variant="outline" onClick={openCreate}>
                            <PlusIcon data-icon="inline-start" />
                            Add your first contact
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-2 py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                            No contacts match your search.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((contact) => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                applications={applications}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={formOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingContact ? 'Edit Contact' : 'New Contact'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingContact
                                ? 'Update contact details.'
                                : 'Add a recruiter, HR manager, or interviewer to your network.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact-name">Name</Label>
                                <Input
                                    id="contact-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="Juan dela Cruz"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="contact-email">Email</Label>
                                    <Input
                                        id="contact-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        aria-invalid={!!errors.email}
                                        placeholder="juan@company.com"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="contact-phone">Phone</Label>
                                    <Input
                                        id="contact-phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+63 917 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="contact-company">Company</Label>
                                    <Input
                                        id="contact-company"
                                        value={data.company_name}
                                        onChange={(e) =>
                                            setData('company_name', e.target.value)
                                        }
                                        placeholder="Acme Corp"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="contact-role">Role</Label>
                                    <Input
                                        id="contact-role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        placeholder="HR Manager"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact-last-contacted">
                                    Last Contacted
                                </Label>
                                <Input
                                    id="contact-last-contacted"
                                    type="date"
                                    value={data.last_contacted_at}
                                    onChange={(e) =>
                                        setData('last_contacted_at', e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="contact-notes">Notes</Label>
                                <Textarea
                                    id="contact-notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Met at job fair, referred by..."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : editingContact
                                      ? 'Update'
                                      : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDestructiveDialog
                open={deletingContact !== null}
                onOpenChange={(open) => !open && setDeletingContact(null)}
                title="Delete Contact?"
                description={deletingContact && `Are you sure you want to delete "${deletingContact.name}"? This action cannot be undone.`}
                onConfirm={() => {
                    if (deletingContact) {
                        router.delete(deleteContact.url(deletingContact.id));
                    }
                }}
            />
        </>
    );
}

ContactsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
