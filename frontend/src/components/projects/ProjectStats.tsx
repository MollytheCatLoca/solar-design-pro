// src/components/projects/ProjectStats.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Zap,
    Sun,
    DollarSign,
    TrendingUp,
    FileText,
    Calendar
} from 'lucide-react';

interface ProjectStatsProps {
    designsCount: number;
    totalCapacity: number;
    estimatedProduction: number;
    totalInvestment: number;
}

export default function ProjectStats({
    designsCount,
    totalCapacity,
    estimatedProduction,
    totalInvestment,
}: ProjectStatsProps) {
    const stats = [
        {
            title: 'Diseños Creados',
            value: designsCount.toString(),
            description: 'Versiones del diseño',
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Capacidad Total',
            value: `${totalCapacity.toFixed(1)} MW`,
            description: 'Potencia instalada',
            icon: Zap,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
        },
        {
            title: 'Producción Anual',
            value: `${estimatedProduction.toFixed(1)} GWh`,
            description: 'Estimación anual',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Inversión Total',
            value: `$${(totalInvestment / 1000000).toFixed(1)}M`,
            description: 'CAPEX estimado',
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ];

    return (
        <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
        {
            stats.map((stat) => (
                <Card key= { stat.title } >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" >
            <CardTitle className="text-sm font-medium" >
            { stat.title }
            </CardTitle>
            < div className = {`p-2 rounded-lg ${stat.bgColor}`} >
        <stat.icon className={ `h-4 w-4 ${stat.color}` } />
            </div>
            </CardHeader>
            < CardContent >
            <div className="text-2xl font-bold" > { stat.value } </div>
                < p className = "text-xs text-muted-foreground" >
                    { stat.description }
                    </p>
                    </CardContent>
                    </Card>
      ))
}
</div>
  );
}