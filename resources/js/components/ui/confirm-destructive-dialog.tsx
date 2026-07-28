import { Trash2Icon } from 'lucide-react';
import type { ReactNode, ReactElement } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDestructiveDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description: ReactNode;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    icon?: ReactNode;
    trigger?: ReactElement;
}

export function ConfirmDestructiveDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    icon = <Trash2Icon />,
    trigger,
}: ConfirmDestructiveDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <AlertDialogTrigger render={trigger} />}
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    {icon && (
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                            {icon}
                        </AlertDialogMedia>
                    )}
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onConfirm}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
