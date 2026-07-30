import { Head, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Save, FileText } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';

interface LegalDocument {
    id: number;
    key: string;
    title: string;
    content: string;
    version: number;
    created_at: string;
    updated_at: string;
}

export default function AdminLegal({
    documents = [],
}: {
    documents?: LegalDocument[];
}) {
    const privacyDoc = documents.find((d) => d.key === 'privacy-policy');
    const termsDoc = documents.find((d) => d.key === 'terms-of-service');

    const [privacyTitle, setPrivacyTitle] = useState(privacyDoc?.title ?? 'Privacy Policy');
    const [privacyContent, setPrivacyContent] = useState(privacyDoc?.content ?? '');
    const [termsTitle, setTermsTitle] = useState(termsDoc?.title ?? 'Terms of Service');
    const [termsContent, setTermsContent] = useState(termsDoc?.content ?? '');
    const [saving, setSaving] = useState<string | null>(null);

    function handleSave(key: string) {
        setSaving(key);

        const doc = key === 'privacy-policy'
            ? { title: privacyTitle, content: privacyContent }
            : { title: termsTitle, content: termsContent };

        const document = documents.find((d) => d.key === key);

        if (document) {
            router.put(`/admin/legal-documents/${document.id}`, doc, {
                preserveScroll: true,
                onFinish: () => setSaving(null),
            });
        }
    }

    return (
        <>
            <Head title="Legal Documents" />

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <PageHeader
                    title="Legal Documents"
                    description="Manage Privacy Policy and Terms of Service"
                >
                    <Badge variant="outline" className="gap-1">
                        <FileText className="size-3" />
                        {documents.length} document{documents.length !== 1 ? 's' : ''}
                    </Badge>
                </PageHeader>

                <Tabs defaultValue="privacy-policy">
                    <TabsList>
                        <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
                        <TabsTrigger value="terms-of-service">Terms of Service</TabsTrigger>
                    </TabsList>

                    <TabsContent value="privacy-policy">
                        <Card>
<CardHeader>
                                 <CardTitle>Edit Privacy Policy</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <p className="text-xs text-muted-foreground">
                                     Fields marked with <span className="text-red-500">*</span> are required.
                                 </p>
                                 <div>
                                     <label
                                         htmlFor="privacy-title"
                                         className="mb-1.5 block text-sm font-medium text-foreground"
                                     >
                                         Title <span className="text-red-500">*</span>
                                     </label>
                                    <Input
                                        id="privacy-title"
                                        value={privacyTitle}
                                        onChange={(e) => setPrivacyTitle(e.target.value)}
                                    />
                                </div>
                                <div>
<label
                                         htmlFor="privacy-content"
                                         className="mb-1.5 block text-sm font-medium text-foreground"
                                     >
                                         Content (Markdown supported) <span className="text-red-500">*</span>
                                     </label>
                                    <Textarea
                                        id="privacy-content"
                                        value={privacyContent}
                                        onChange={(e) => setPrivacyContent(e.target.value)}
                                        className="min-h-[400px] font-mono text-sm"
                                        placeholder="Enter the privacy policy content in Markdown format..."
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Version {privacyDoc?.version ?? 0}
                                    {privacyDoc?.updated_at && ` · Last updated ${new Date(privacyDoc.updated_at).toLocaleDateString()}`}
                                </span>
                                <Button
                                    onClick={() => handleSave('privacy-policy')}
                                    disabled={saving === 'privacy-policy'}
                                >
                                    <Save data-icon="inline-start" />
                                    {saving === 'privacy-policy' ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

<TabsContent value="terms-of-service">
                         <Card>
                             <CardHeader>
                                 <CardTitle>Edit Terms of Service</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <p className="text-xs text-muted-foreground">
                                     Fields marked with <span className="text-red-500">*</span> are required.
                                 </p>
                                 <div>
                                     <label
                                         htmlFor="terms-title"
                                         className="mb-1.5 block text-sm font-medium text-foreground"
                                     >
                                         Title <span className="text-red-500">*</span>
                                     </label>
                                    <Input
                                        id="terms-title"
                                        value={termsTitle}
                                        onChange={(e) => setTermsTitle(e.target.value)}
                                    />
                                </div>
                                <div>
<label
                                         htmlFor="terms-content"
                                         className="mb-1.5 block text-sm font-medium text-foreground"
                                     >
                                         Content (Markdown supported) <span className="text-red-500">*</span>
                                     </label>
                                    <Textarea
                                        id="terms-content"
                                        value={termsContent}
                                        onChange={(e) => setTermsContent(e.target.value)}
                                        className="min-h-[400px] font-mono text-sm"
                                        placeholder="Enter the terms of service content in Markdown format..."
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    Version {termsDoc?.version ?? 0}
                                    {termsDoc?.updated_at && ` · Last updated ${new Date(termsDoc.updated_at).toLocaleDateString()}`}
                                </span>
                                <Button
                                    onClick={() => handleSave('terms-of-service')}
                                    disabled={saving === 'terms-of-service'}
                                >
                                    <Save data-icon="inline-start" />
                                    {saving === 'terms-of-service' ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

AdminLegal.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
