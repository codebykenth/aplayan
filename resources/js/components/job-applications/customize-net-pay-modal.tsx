import { useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon, RotateCcwIcon, ChevronDownIcon, ChevronUpIcon, AlertCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JobApplication, TaxConfig, TaxAllowance, TaxCustomDeduction } from '@/types/job-application';
import { TAX_REGIMES } from '@/types/job-application';

function formatSalary(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

interface CustomizeNetPayModalProps {
    offer: JobApplication;
    userDefaults: TaxConfig | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_CONFIG: TaxConfig = {
    regime: 'ph_regular',
    allowances: [],
    custom_deductions: [],
    manual_net_override: null,
    override_sss: null,
    override_philhealth: null,
    override_pagibig: null,
    override_bir_tax: null,
};

export default function CustomizeNetPayModal({ offer, userDefaults, open, onOpenChange }: CustomizeNetPayModalProps) {
    const initialConfig: TaxConfig = offer.tax_config
        ? { ...DEFAULT_CONFIG, ...offer.tax_config }
        : userDefaults
            ? { ...DEFAULT_CONFIG, ...userDefaults }
            : DEFAULT_CONFIG;

    const { data, setData, patch, processing, errors } = useForm({
        tax_config: initialConfig,
    });
    const config = data.tax_config;
    const [showOverrides, setShowOverrides] = useState(
        Boolean(config.override_sss || config.override_philhealth || config.override_pagibig || config.override_bir_tax)
    );
    const [clientError, setClientError] = useState<string | null>(null);

    function updateConfig(updater: (prev: TaxConfig) => TaxConfig) {
        setClientError(null);
        setData('tax_config', updater(config));
    }

    function handleSave() {
        setClientError(null);

        // Validate allowances
        for (const [i, a] of config.allowances.entries()) {
            if (!a.name || a.name.trim() === '') {
                setClientError(`Allowance #${i + 1} requires a valid description.`);

                return;
            }

            if (!a.amount || Number.isNaN(a.amount) || a.amount <= 0) {
                setClientError(`Allowance "${a.name}" requires a valid amount greater than 0.`);

                return;
            }
        }

        // Validate custom deductions
        for (const [i, d] of config.custom_deductions.entries()) {
            if (!d.name || d.name.trim() === '') {
                setClientError(`Custom deduction #${i + 1} requires a valid description.`);

                return;
            }

            if (!d.amount || Number.isNaN(d.amount) || d.amount <= 0) {
                setClientError(`Custom deduction "${d.name}" requires a valid amount greater than 0.`);

                return;
            }
        }

        patch(`/job-applications/${offer.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onError: (errs) => {
                if (errs['tax_config']) {
                    setClientError(errs['tax_config']);
                }
            },
        });
    }

    function handleReset() {
        setClientError(null);
        setData('tax_config', userDefaults ? { ...DEFAULT_CONFIG, ...userDefaults } : DEFAULT_CONFIG);
    }

    function addAllowance(taxable: boolean) {
        updateConfig((prev) => ({
            ...prev,
            allowances: [...prev.allowances, { name: '', amount: 0, taxable }],
        }));
    }

    function removeAllowance(index: number) {
        updateConfig((prev) => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index),
        }));
    }

    function updateAllowance(index: number, field: keyof TaxAllowance, value: string | number | boolean) {
        updateConfig((prev) => ({
            ...prev,
            allowances: prev.allowances.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
        }));
    }

    function addCustomDeduction() {
        updateConfig((prev) => ({
            ...prev,
            custom_deductions: [...prev.custom_deductions, { name: '', amount: 0 }],
        }));
    }

    function removeCustomDeduction(index: number) {
        updateConfig((prev) => ({
            ...prev,
            custom_deductions: prev.custom_deductions.filter((_, i) => i !== index),
        }));
    }

    function updateCustomDeduction(index: number, field: keyof TaxCustomDeduction, value: string | number) {
        updateConfig((prev) => ({
            ...prev,
            custom_deductions: prev.custom_deductions.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
        }));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Net Pay</DialogTitle>
                    <DialogDescription>
                        Configure tax settings for this offer. Overrides global defaults.
                    </DialogDescription>
                </DialogHeader>

                {clientError && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                        <AlertCircleIcon className="size-4 shrink-0" />
                        <span>{clientError}</span>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Tax Regime</Label>
                        <Select
                            value={config.regime}
                            onValueChange={(value) =>
                                updateConfig((prev) => ({ ...prev, regime: value as TaxConfig['regime'] }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {TAX_REGIMES.find((r) => r.value === config.regime)?.label ?? 'Select Tax Regime'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false} side="bottom" sideOffset={4}>
                                {TAX_REGIMES.map((regime) => (
                                    <SelectItem key={regime.value} value={regime.value}>
                                        <div className="flex flex-col">
                                            <span>{regime.label}</span>
                                            <span className="text-xs text-muted-foreground">{regime.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Non-Taxable Allowances</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => addAllowance(false)}>
                                <PlusIcon className="size-3.5" />
                                Add
                            </Button>
                        </div>
                        {config.allowances.filter((a) => !a.taxable).length === 0 && (
                            <p className="text-xs text-muted-foreground">No non-taxable allowances added.</p>
                        )}
                        {config.allowances
                            .map((a, i) => ({ ...a, originalIndex: i }))
                            .filter((a) => !a.taxable)
                            .map((a) => (
                                <div key={a.originalIndex} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Description (e.g. Rice)"
                                        value={a.name}
                                        onChange={(e) => updateAllowance(a.originalIndex, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="Amount"
                                        value={a.amount || ''}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                            updateAllowance(a.originalIndex, 'amount', Number.isNaN(val) ? 0 : val);
                                        }}
                                        className="w-28"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeAllowance(a.originalIndex)}
                                    >
                                        <TrashIcon className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Taxable Allowances</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => addAllowance(true)}>
                                <PlusIcon className="size-3.5" />
                                Add
                            </Button>
                        </div>
                        {config.allowances.filter((a) => a.taxable).length === 0 && (
                            <p className="text-xs text-muted-foreground">No taxable allowances added.</p>
                        )}
                        {config.allowances
                            .map((a, i) => ({ ...a, originalIndex: i }))
                            .filter((a) => a.taxable)
                            .map((a) => (
                                <div key={a.originalIndex} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Description (e.g. Bonus)"
                                        value={a.name}
                                        onChange={(e) => updateAllowance(a.originalIndex, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="Amount"
                                        value={a.amount || ''}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                            updateAllowance(a.originalIndex, 'amount', Number.isNaN(val) ? 0 : val);
                                        }}
                                        className="w-28"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => removeAllowance(a.originalIndex)}
                                    >
                                        <TrashIcon className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Custom Deductions</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addCustomDeduction}>
                                <PlusIcon className="size-3.5" />
                                Add
                            </Button>
                        </div>
                        {config.custom_deductions.length === 0 && (
                            <p className="text-xs text-muted-foreground">No custom deductions added.</p>
                        )}
                        {config.custom_deductions.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    placeholder="Description (e.g. HMO Dependent)"
                                    value={d.name}
                                    onChange={(e) => updateCustomDeduction(i, 'name', e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="Amount"
                                    value={d.amount || ''}
                                    onChange={(e) => {
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        updateCustomDeduction(i, 'amount', Number.isNaN(val) ? 0 : val);
                                    }}
                                    className="w-28"
                                />
                                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeCustomDeduction(i)}>
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <button
                            type="button"
                            onClick={() => setShowOverrides(!showOverrides)}
                            className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                            <span>Statutory Deduction Overrides (Optional)</span>
                            {showOverrides ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
                        </button>
                        {showOverrides && (
                            <div className="mt-3 flex flex-col gap-3">
                                <p className="text-xs text-muted-foreground">
                                    Override statutory calculations with manual amounts. Leave empty to use auto-calculation.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">SSS Override (₱)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Auto"
                                            value={config.override_sss ?? ''}
                                            onChange={(e) =>
                                                updateConfig((prev) => ({
                                                    ...prev,
                                                    override_sss: e.target.value === '' ? null : parseFloat(e.target.value),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">PhilHealth Override (₱)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Auto"
                                            value={config.override_philhealth ?? ''}
                                            onChange={(e) =>
                                                updateConfig((prev) => ({
                                                    ...prev,
                                                    override_philhealth: e.target.value === '' ? null : parseFloat(e.target.value),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">Pag-IBIG Override (₱)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Auto"
                                            value={config.override_pagibig ?? ''}
                                            onChange={(e) =>
                                                updateConfig((prev) => ({
                                                    ...prev,
                                                    override_pagibig: e.target.value === '' ? null : parseFloat(e.target.value),
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs text-muted-foreground">BIR Tax Override (₱)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Auto"
                                            value={config.override_bir_tax ?? ''}
                                            onChange={(e) =>
                                                updateConfig((prev) => ({
                                                    ...prev,
                                                    override_bir_tax: e.target.value === '' ? null : parseFloat(e.target.value),
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Manual Net Pay Override (optional)</Label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Leave empty for auto-calculation"
                                value={config.manual_net_override ?? ''}
                                onChange={(e) =>
                                    updateConfig((prev) => ({
                                        ...prev,
                                        manual_net_override: e.target.value === '' ? null : parseFloat(e.target.value),
                                    }))
                                }
                                className="pl-7"
                            />
                        </div>
                        {config.manual_net_override !== null && (
                            <p className="text-xs text-muted-foreground">
                                All statutory deductions will be zeroed. Net pay will be {formatSalary(config.manual_net_override)}/mo.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleReset}>
                        <RotateCcwIcon className="size-3.5" />
                        Reset to Default
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
