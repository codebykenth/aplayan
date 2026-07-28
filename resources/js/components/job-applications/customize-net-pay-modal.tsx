import { useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
};

export default function CustomizeNetPayModal({ offer, userDefaults, open, onOpenChange }: CustomizeNetPayModalProps) {
    const initialConfig: TaxConfig = offer.tax_config
        ? { ...DEFAULT_CONFIG, ...offer.tax_config }
        : userDefaults
            ? { ...DEFAULT_CONFIG, ...userDefaults }
            : DEFAULT_CONFIG;

    const { data, setData, patch, processing } = useForm({
        tax_config: initialConfig,
    });
    const config = data.tax_config;

    function updateConfig(updater: (prev: TaxConfig) => TaxConfig) {
        setData('tax_config', updater(config));
    }

    function handleSave() {
        patch(`/job-applications/${offer.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    function handleReset() {
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Customize Net Pay</DialogTitle>
                    <DialogDescription>
                        Configure tax settings for this offer. Overrides global defaults.
                    </DialogDescription>
                </DialogHeader>

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
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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
                                        placeholder="Name"
                                        value={a.name}
                                        onChange={(e) => updateAllowance(a.originalIndex, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={a.amount || ''}
                                        onChange={(e) =>
                                            updateAllowance(a.originalIndex, 'amount', parseFloat(e.target.value) || 0)
                                        }
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
                                        placeholder="Name"
                                        value={a.name}
                                        onChange={(e) => updateAllowance(a.originalIndex, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={a.amount || ''}
                                        onChange={(e) =>
                                            updateAllowance(a.originalIndex, 'amount', parseFloat(e.target.value) || 0)
                                        }
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
                                    placeholder="Name"
                                    value={d.name}
                                    onChange={(e) => updateCustomDeduction(i, 'name', e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={d.amount || ''}
                                    onChange={(e) =>
                                        updateCustomDeduction(i, 'amount', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-28"
                                />
                                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeCustomDeduction(i)}>
                                    <TrashIcon className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Manual Net Pay Override (optional)</Label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                placeholder="Leave empty for auto-calculation"
                                value={config.manual_net_override ?? ''}
                                onChange={(e) =>
                                    updateConfig((prev) => ({
                                        ...prev,
                                        manual_net_override: e.target.value ? parseFloat(e.target.value) : null,
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
