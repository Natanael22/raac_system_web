import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    loading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    loading = false
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Aguarde...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
