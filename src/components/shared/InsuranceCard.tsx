import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CreditCard } from 'lucide-react'

interface Insurance {
    name: string
    plan: string
    number: string
    expiryDate: string
}

interface InsuranceCardProps {
    insurance: Insurance
}

export function InsuranceCard({ insurance }: InsuranceCardProps) {
    const isExpired = new Date(insurance.expiryDate) < new Date()

    return (
        <Card className={isExpired ? 'border-danger/50 bg-danger/5' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-neutral-dark flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Convênio
                </CardTitle>
                {isExpired ? (
                    <Badge variant="destructive" className="flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Vencido
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-success border-success">Ativo</Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">{insurance.name}</div>
                <p className="text-xs text-muted-foreground mt-1">Plano: {insurance.plan}</p>
                <div className="mt-4 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-neutral-dark mb-1">Carteirinha</p>
                        <p className="font-mono text-sm">{insurance.number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-neutral-dark mb-1">Validade</p>
                        <p className="text-sm font-medium">{insurance.expiryDate}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
