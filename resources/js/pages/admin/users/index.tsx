import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Search, Shield, ShieldOff, Trash2, BadgeCheck } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ConfirmDestructiveDialog,
} from '@/components/ui/confirm-destructive-dialog';
import AdminLayout from '@/layouts/admin-layout';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    avatar?: string | null;
}

interface PaginatedUsers {
    data: User[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
    links?: { url: string | null; label: string; active: boolean }[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function AdminUsers({
    users,
    filters,
}: {
    users: PaginatedUsers;
    filters: { search?: string };
}) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const pagination = users.meta ?? users;
    const links = pagination.links ?? [];
    const lastPage = pagination.last_page ?? 1;

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', { search: searchValue || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleToggleRole(userId: number) {
        router.post(`/admin/users/${userId}/toggle-role`, {}, {
            preserveScroll: true,
        });
    }

    function handleDeleteUser() {
        if (!deleteUser) return;
        router.delete(`/admin/users/${deleteUser.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteUser(null),
        });
    }

    return (
        <>
            <Head title="User Management" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="User Management"
                    description="View, search, and manage registered users"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Button type="submit" variant="default">
                                Search
                            </Button>
                        </form>

                        {users.data.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No users found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Name</th>
                                            <th className="pb-2 pr-4 font-medium">Email</th>
                                            <th className="pb-2 pr-4 font-medium">Role</th>
                                            <th className="pb-2 pr-4 font-medium">Joined</th>
                                            <th className="pb-2 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr key={user.id} className="border-b border-border last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-foreground">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    {user.role === 'admin' ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <BadgeCheck className="size-3" />
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">User</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={() => handleToggleRole(user.id)}
                                                            title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                                                        >
                                                            {user.role === 'admin' ? (
                                                                <ShieldOff className="size-3.5" />
                                                            ) : (
                                                                <Shield className="size-3.5" />
                                                            )}
                                                            <span className="ml-1">
                                                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteUser(user)}
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                                <span>
                                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of {pagination.total ?? 0}
                                </span>
                                <div className="flex items-center gap-1">
                                    {links.map((link, i) => {
                                        if (!link.url) {
                                            return (
                                                <span key={i} className="px-2 py-1 text-muted-foreground/50">
                                                    {link.label}
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`px-2 py-1 rounded transition-colors ${
                                                    link.active
                                                        ? 'bg-primary/10 font-medium text-primary'
                                                        : 'hover:bg-muted text-muted-foreground'
                                                }`}
                                                preserveState
                                                preserveScroll
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDestructiveDialog
                open={deleteUser !== null}
                onOpenChange={(open) => { if (!open) setDeleteUser(null); }}
                title="Delete User"
                description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDeleteUser}
            />
        </>
    );
}

AdminUsers.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
