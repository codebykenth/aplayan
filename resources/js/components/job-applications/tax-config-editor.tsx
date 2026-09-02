import {
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import type {
    TaxConfig,
    TaxAllowance,
    TaxCustomDeduction,
} from '@/types/job-application';
import { TAX_REGIMES } from '@/types/job-application';

interface TaxConfigEditorProps {
    taxConfig: TaxConfig | null;
    onChange: (taxConfig: TaxConfig) => void;
    errors?: Record<string, string>;
    disabled?: boolean;
    autoExpand?: boolean;
}

const DEFAULT_TAX_CONFIG: TaxConfig = {
    regime: 'ph_regular',
    allowances: [],
    custom_deductions: [],
    manual_net_override: null,
    override_sss: null,
    override_philhealth: null,
    override_pagibig: null,
    override_bir_tax: null,
};

export default function TaxConfigEditor({
    taxConfig,
    onChange,
    errors = {},
    disabled = false,
    autoExpand = false,
}: TaxConfigEditorProps) {
    const [expanded, setExpanded] = useState(autoExpand);
    const [overridesExpanded, setOverridesExpanded] = useState(false);

    const config = taxConfig ?? DEFAULT_TAX_CONFIG;

    const updateField = <K extends keyof TaxConfig>(
        key: K,
        value: TaxConfig[K],
    ) => {
        onChange({ ...config, [key]: value });
    };

    const addAllowance = () => {
        const newAllowance: TaxAllowance = {
            name: '',
            amount: 0,
            taxable: false,
        };
        onChange({
            ...config,
            allowances: [...config.allowances, newAllowance],
        });
    };

    const updateAllowance = (
        index: number,
        field: keyof TaxAllowance,
        value: string | number | boolean,
    ) => {
        const updated = [...config.allowances];
        updated[index] = { ...updated[index], [field]: value };
        onChange({ ...config, allowances: updated });
    };

    const removeAllowance = (index: number) => {
        onChange({
            ...config,
            allowances: config.allowances.filter((_, i) => i !== index),
        });
    };

    const addCustomDeduction = () => {
        const newDeduction: TaxCustomDeduction = { name: '', amount: 0 };
        onChange({
            ...config,
            custom_deductions: [...config.custom_deductions, newDeduction],
        });
    };

    const updateCustomDeduction = (
        index: number,
        field: keyof TaxCustomDeduction,
        value: string | number,
    ) => {
        const updated = [...config.custom_deductions];
        updated[index] = { ...updated[index], [field]: value };
        onChange({ ...config, custom_deductions: updated });
    };

    const removeCustomDeduction = (index: number) => {
        onChange({
            ...config,
            custom_deductions: config.custom_deductions.filter(
                (_, i) => i !== index,
            ),
        });
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
                disabled={disabled}
            >
                <span className="flex items-center gap-1 font-medium">
                    Offer & Tax Configuration
                </span>
                {expanded ? (
                    <ChevronUpIcon className="size-3.5" />
                ) : (
                    <ChevronDownIcon className="size-3.5" />
                )}
            </button>

            {expanded && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs">Tax Regime</Label>
                        <Select
                            value={config.regime}
                            onValueChange={(value) =>
                                updateField(
                                    'regime',
                                    value as TaxConfig['regime'],
                                )
                            }
                            disabled={disabled}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <span className="line-clamp-1 flex flex-1 text-left">
                                    {config.regime
                                        ? TAX_REGIMES.find(
                                              (r) => r.value === config.regime,
                                          )?.label
                                        : 'Select regime'}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {TAX_REGIMES.map((regime) => (
                                    <SelectItem
                                        key={regime.value}
                                        value={regime.value}
                                        label={regime.label}
                                    >
                                        {regime.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors['regime'] && (
                            <p className="text-xs text-destructive">
                                {errors['regime']}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-xs">
                            Manual Net Override (₱)
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                                ₱
                            </span>
                            <Input
                                type="number"
                                min={0}
                                className="h-8 pl-6 text-xs"
                                value={config.manual_net_override ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        'manual_net_override',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="0"
                                disabled={disabled}
                            />
                        </div>
                        {errors['manual_net_override'] && (
                            <p className="text-xs text-destructive">
                                {errors['manual_net_override']}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setOverridesExpanded(!overridesExpanded)
                            }
                            className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            disabled={disabled}
                        >
                            <span>Statutory Deduction Overrides</span>
                            {overridesExpanded ? (
                                <ChevronUpIcon className="size-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                            )}
                        </button>

                        {overridesExpanded && (
                            <div className="flex flex-col gap-3 pl-2">
                                {(
                                    [
                                        'override_sss',
                                        'override_philhealth',
                                        'override_pagibig',
                                        'override_bir_tax',
                                    ] as const
                                ).map((field) => (
                                    <div
                                        key={field}
                                        className="flex flex-col gap-1"
                                    >
                                        <Label className="text-[11px]">
                                            {field === 'override_sss' &&
                                                'SSS Override'}
                                            {field === 'override_philhealth' &&
                                                'PhilHealth Override'}
                                            {field === 'override_pagibig' &&
                                                'Pag-IBIG Override'}
                                            {field === 'override_bir_tax' &&
                                                'BIR Tax Override'}
                                        </Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                                                ₱
                                            </span>
                                            <Input
                                                type="number"
                                                min={0}
                                                className="h-7 pl-6 text-xs"
                                                value={config[field] ?? ''}
                                                onChange={(e) =>
                                                    updateField(
                                                        field,
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                placeholder="Auto"
                                                disabled={disabled}
                                            />
                                        </div>
                                        {errors[field] && (
                                            <p className="text-xs text-destructive">
                                                {errors[field]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Allowances</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={addAllowance}
                                disabled={disabled}
                            >
                                <PlusIcon className="size-3" />
                                Add
                            </Button>
                        </div>
                        {config.allowances.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">
                                No allowances added
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {config.allowances.map((allowance, index) => (
                                    <div
                                        key={index}
                                        className="flex items-end gap-2"
                                    >
                                        <div className="flex flex-1 flex-col gap-1">
                                            <Input
                                                className="h-7 text-xs"
                                                value={allowance.name}
                                                onChange={(e) =>
                                                    updateAllowance(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Allowance name"
                                                disabled={disabled}
                                            />
                                            {errors[
                                                `allowances.${index}.name`
                                            ] && (
                                                <p className="text-xs text-destructive">
                                                    {
                                                        errors[
                                                            `allowances.${index}.name`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex w-24 flex-col gap-1">
                                            <div className="relative">
                                                <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    ₱
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="h-7 pl-5 text-xs"
                                                    value={
                                                        allowance.amount || ''
                                                    }
                                                    onChange={(e) =>
                                                        updateAllowance(
                                                            index,
                                                            'amount',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="0"
                                                    disabled={disabled}
                                                />
                                            </div>
                                            {errors[
                                                `allowances.${index}.amount`
                                            ] && (
                                                <p className="text-xs text-destructive">
                                                    {
                                                        errors[
                                                            `allowances.${index}.amount`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={allowance.taxable}
                                                onChange={(e) =>
                                                    updateAllowance(
                                                        index,
                                                        'taxable',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="size-3"
                                                disabled={disabled}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                Taxable
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                removeAllowance(index)
                                            }
                                            disabled={disabled}
                                        >
                                            <Trash2Icon className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Custom Deductions</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={addCustomDeduction}
                                disabled={disabled}
                            >
                                <PlusIcon className="size-3" />
                                Add
                            </Button>
                        </div>
                        {config.custom_deductions.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">
                                No deductions added
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {config.custom_deductions.map(
                                    (deduction, index) => (
                                        <div
                                            key={index}
                                            className="flex items-end gap-2"
                                        >
                                            <div className="flex flex-1 flex-col gap-1">
                                                <Input
                                                    className="h-7 text-xs"
                                                    value={deduction.name}
                                                    onChange={(e) =>
                                                        updateCustomDeduction(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Deduction name"
                                                    disabled={disabled}
                                                />
                                                {errors[
                                                    `custom_deductions.${index}.name`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            errors[
                                                                `custom_deductions.${index}.name`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex w-24 flex-col gap-1">
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                        ₱
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        className="h-7 pl-5 text-xs"
                                                        value={
                                                            deduction.amount ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateCustomDeduction(
                                                                index,
                                                                'amount',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="0"
                                                        disabled={disabled}
                                                    />
                                                </div>
                                                {errors[
                                                    `custom_deductions.${index}.amount`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            errors[
                                                                `custom_deductions.${index}.amount`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    removeCustomDeduction(index)
                                                }
                                                disabled={disabled}
                                            >
                                                <Trash2Icon className="size-3" />
                                            </Button>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
