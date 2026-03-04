import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface DigitalSignatureProps {
    onSign: (signatureDataUrl: string) => void
    label?: string
}

export function DigitalSignature({ onSign, label = 'Assinatura Digital' }: DigitalSignatureProps) {
    const [signed, setSigned] = useState(false)

    const handleSign = () => {
        setSigned(true)
        onSign('data:image/png;base64,fake-signature-data')
    }

    const handleClear = () => {
        setSigned(false)
        onSign('')
    }

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm">
            <Label>{label}</Label>
            <div className="border border-neutral-300 rounded-md h-32 bg-neutral-light/50 flex flex-col items-center justify-center p-4">
                {signed ? (
                    <div className="text-success font-script text-2xl rotate-[-5deg]">Assinado Digitalmente</div>
                ) : (
                    <span className="text-muted-foreground text-sm">Área de assinatura</span>
                )}
            </div>
            <div className="flex gap-2 justify-end mt-1">
                <Button variant="outline" size="sm" onClick={handleClear} disabled={!signed} type="button">
                    Limpar
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSign} disabled={signed} type="button">
                    Assinar
                </Button>
            </div>
        </div>
    )
}
