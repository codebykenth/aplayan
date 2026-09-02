import { useForm } from '@inertiajs/react';
import {
    UploadIcon,
    FileTextIcon,
    FileJsonIcon,
    DownloadIcon,
    XIcon,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { importMethod } from '@/routes/job-applications';

type ImportFormat = 'csv' | 'json';

const REQUIRED_FIELDS = [
    { name: 'company_name', description: 'Company name', required: true },
    { name: 'job_title', description: 'Job title', required: true },
];

const OPTIONAL_FIELDS = [
    {
        name: 'status',
        description: 'Application status',
        required: false,
        default: 'wishlist',
    },
    {
        name: 'location',
        description: 'Job location',
        required: false,
        default: 'Remote',
    },
    {
        name: 'expected_salary',
        description: 'Expected salary',
        required: false,
        default: null,
    },
    {
        name: 'date_applied',
        description: 'Date applied (YYYY-MM-DD)',
        required: false,
        default: null,
    },
    {
        name: 'job_url',
        description: 'Job posting URL',
        required: false,
        default: null,
    },
    {
        name: 'job_description',
        description: 'Job description',
        required: false,
        default: null,
    },
    {
        name: 'notes',
        description: 'Additional notes',
        required: false,
        default: null,
    },
];

const STATUS_OPTIONS = [
    'wishlist',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn',
];

function generateSampleCsv(): string {
    const headers = [
        'company_name',
        'job_title',
        'status',
        'location',
        'expected_salary',
        'date_applied',
        'job_url',
        'job_description',
        'notes',
    ];
    const rows = [
        [
            'Acme Corp',
            'Software Engineer',
            'applied',
            'Remote',
            '50000',
            '2024-01-15',
            'https://example.com/job1',
            'Senior role',
            'Applied via referral',
        ],
        [
            'Globex',
            'Product Manager',
            'interviewing',
            'Metro Manila',
            '80000',
            '2024-02-20',
            '',
            '',
            '',
        ],
    ];
    const csvRows = rows
        .map((row) => row.map((field) => `"${field}"`).join(','))
        .join('\n');

    return `${headers.join(',')}\n${csvRows}`;
}

function generateSampleJson(): string {
    const data = [
        {
            company_name: 'Acme Corp',
            job_title: 'Software Engineer',
            status: 'applied',
            location: 'Remote',
            expected_salary: 50000,
            date_applied: '2024-01-15',
            job_url: 'https://example.com/job1',
            job_description: 'Senior role',
            notes: 'Applied via referral',
        },
        {
            company_name: 'Globex',
            job_title: 'Product Manager',
            status: 'interviewing',
            location: 'Metro Manila',
            expected_salary: 80000,
            date_applied: '2024-02-20',
        },
    ];

    return JSON.stringify(data, null, 2);
}

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default function ImportModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });

    function handleClose() {
        setSelectedFile(null);
        importForm.reset();
        onClose();
    }

    function handleDragEnter(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;

        if (files && files.length > 0) {
            const file = files[0];

            if (isValidFileType(file)) {
                setSelectedFile(file);
            }
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            setSelectedFile(file);
        }
    }

    function isValidFileType(file: File): boolean {
        const validTypes = [
            'text/csv',
            'text/plain',
            'application/json',
            'text/json',
        ];
        const validExtensions = ['.csv', '.txt', '.json'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();

        return (
            validTypes.includes(file.type) ||
            validExtensions.includes(extension)
        );
    }

    function handleSubmit() {
        if (!selectedFile) {
            return;
        }

        importForm.setData('file', selectedFile);
        importForm.post(importMethod.url(), {
            onSuccess: () => {
                handleClose();
            },
            preserveScroll: true,
        });
    }

    function handleDownloadSample(format: ImportFormat) {
        if (format === 'csv') {
            downloadFile(
                generateSampleCsv(),
                'sample_applications.csv',
                'text/csv',
            );
        } else {
            downloadFile(
                generateSampleJson(),
                'sample_applications.json',
                'application/json',
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <DialogTitle>Import Job Applications</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or JSON file to import your job
                        applications. Download a sample template to check
                        formatting.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                    <Tabs
                        defaultValue="csv"
                        className="flex w-full flex-col gap-4"
                    >
                        <TabsList className="grid h-9 w-full shrink-0 grid-cols-2 rounded-lg bg-muted p-1">
                            <TabsTrigger
                                value="csv"
                                className="flex items-center justify-center gap-1.5 text-xs font-medium sm:text-sm"
                            >
                                <FileTextIcon />
                                CSV Format
                            </TabsTrigger>
                            <TabsTrigger
                                value="json"
                                className="flex items-center justify-center gap-1.5 text-xs font-medium sm:text-sm"
                            >
                                <FileJsonIcon />
                                JSON Format
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="csv"
                            className="mt-0 flex flex-col gap-4"
                        >
                            <div className="flex flex-col justify-between gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
                                <div>
                                    <h4 className="text-sm font-medium">
                                        CSV Format Guide
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Standard comma-separated value
                                        spreadsheet format.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => handleDownloadSample('csv')}
                                >
                                    <DownloadIcon data-icon="inline-start" />
                                    Download Sample CSV
                                </Button>
                            </div>

                            <div className="flex flex-col gap-3 rounded-lg border bg-card p-3.5 text-xs">
                                <div>
                                    <span className="font-semibold text-foreground">
                                        How to import:
                                    </span>
                                    <ol className="mt-1 list-inside list-decimal space-y-1 text-muted-foreground">
                                        <li>
                                            Download the sample CSV template
                                        </li>
                                        <li>
                                            Fill in your job application data
                                            (keep the header row)
                                        </li>
                                        <li>
                                            Ensure{' '}
                                            <code className="font-mono text-foreground">
                                                company_name
                                            </code>{' '}
                                            and{' '}
                                            <code className="font-mono text-foreground">
                                                job_title
                                            </code>{' '}
                                            are present
                                        </li>
                                        <li>Save as CSV and upload the file</li>
                                    </ol>
                                </div>

                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Required Headers:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5 sm:mt-0">
                                        {REQUIRED_FIELDS.map((field) => (
                                            <Badge
                                                key={field.name}
                                                variant="outline"
                                                className="border-red-500/20 bg-red-500/10 font-mono text-red-600 dark:text-red-400"
                                            >
                                                {field.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Optional Headers:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5">
                                        {OPTIONAL_FIELDS.map((field) => (
                                            <Badge
                                                key={field.name}
                                                variant="outline"
                                                className="border-blue-500/20 bg-blue-500/10 font-mono text-blue-600 dark:text-blue-400"
                                            >
                                                {field.name}
                                                {field.default && (
                                                    <span className="ml-1 opacity-70">
                                                        ({field.default})
                                                    </span>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Valid Status Values:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5">
                                        {STATUS_OPTIONS.map((status) => (
                                            <span
                                                key={status}
                                                className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-muted-foreground"
                                            >
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="json"
                            className="mt-0 flex flex-col gap-4"
                        >
                            <div className="flex flex-col justify-between gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
                                <div>
                                    <h4 className="text-sm font-medium">
                                        JSON Format Guide
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Array of job application objects in
                                        standard JSON format.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => handleDownloadSample('json')}
                                >
                                    <DownloadIcon data-icon="inline-start" />
                                    Download Sample JSON
                                </Button>
                            </div>

                            <div className="flex flex-col gap-3 rounded-lg border bg-card p-3.5 text-xs">
                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Required Fields:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5 sm:mt-0">
                                        {REQUIRED_FIELDS.map((field) => (
                                            <Badge
                                                key={field.name}
                                                variant="outline"
                                                className="border-red-500/20 bg-red-500/10 font-mono text-red-600 dark:text-red-400"
                                            >
                                                {field.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Optional Fields:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5">
                                        {OPTIONAL_FIELDS.map((field) => (
                                            <Badge
                                                key={field.name}
                                                variant="outline"
                                                className="border-blue-500/20 bg-blue-500/10 font-mono text-blue-600 dark:text-blue-400"
                                            >
                                                {field.name}
                                                {field.default && (
                                                    <span className="ml-1 opacity-70">
                                                        ({field.default})
                                                    </span>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="mr-2 font-semibold text-foreground">
                                        Valid Status Values:
                                    </span>
                                    <div className="mt-1 inline-flex flex-wrap gap-1.5">
                                        {STATUS_OPTIONS.map((status) => (
                                            <span
                                                key={status}
                                                className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-muted-foreground"
                                            >
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="mb-1 block font-semibold text-foreground">
                                        Example Structure:
                                    </span>
                                    <pre className="max-h-36 overflow-x-auto rounded border border-border bg-muted/80 p-2 text-[11px]">
                                        {`[
  {
    "company_name": "Acme Corp",
    "job_title": "Software Engineer",
    "status": "applied",
    "location": "Remote",
    "expected_salary": 50000,
    "date_applied": "2024-01-15",
    "job_url": "https://example.com/job1",
    "job_description": "Senior role",
    "notes": "Applied via referral"
  }
]`}
                                    </pre>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-foreground">
                            Select or Drop File
                        </label>
                        <div
                            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : selectedFile
                                      ? 'border-green-500 bg-green-500/10'
                                      : 'border-border bg-card hover:border-muted-foreground/50'
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt,.json"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    {selectedFile.name.endsWith('.json') ? (
                                        <FileJsonIcon className="shrink-0 text-green-500" />
                                    ) : (
                                        <FileTextIcon className="shrink-0 text-green-500" />
                                    )}
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(
                                                1,
                                            )}{' '}
                                            KB
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <XIcon />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <UploadIcon className="mx-auto text-muted-foreground" />
                                    <p className="text-xs font-medium text-foreground sm:text-sm">
                                        {isDragActive
                                            ? 'Drop your file here'
                                            : 'Drag & drop file here, or click to browse'}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Supports .csv, .txt, or .json
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {importForm.errors.file && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive dark:bg-destructive/20 dark:text-destructive">
                            {importForm.errors.file}
                        </div>
                    )}
                </div>

                <DialogFooter className="m-0 flex shrink-0 flex-row justify-end gap-2 rounded-b-xl border-t bg-muted/40 px-6 py-3.5">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedFile || importForm.processing}
                    >
                        {importForm.processing
                            ? 'Importing...'
                            : 'Import Applications'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
