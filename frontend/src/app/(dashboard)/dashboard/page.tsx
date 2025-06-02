// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Sun,
    Zap,
    TrendingUp,
    DollarSign,
    Plus,
    ArrowRight,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

const stats = [
    {
        title: 'Proyectos Activos',
        value: '12',
        description: '+2 este mes',
        icon: Sun,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
    },
    {
        title: 'Capacidad Total',
        value: '45.5 MW',
        description: '18 plantas solares',
        icon: Zap,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        title: 'Producción Estimada',
        value: '68.2 GWh',
        description: 'Anual proyectada',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        title: 'Valor Total',
        value: '$125.4M',
        description: 'CAPEX combinado',
        icon: DollarSign,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
];

const recentProjects = [
    {
        id: 1,
        name: 'Planta Solar Norte',
        location: 'Salta, Argentina',
        capacity: '5.2 MW',
        status: 'En diseño',
        progress: 65,
    },
    {
        id: 2,
        name: 'Parque FV Industrial',
        location: 'Córdoba, Argentina',
        capacity: '3.8 MW',
        status: 'Simulación',
        progress: 40,
    },
    {
        id: 3,
        name: 'Solar Mendoza I',
        location: 'Mendoza, Argentina',
        capacity: '8.5 MW',
        status: 'Aprobado',
        progress: 100,
    },
];

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className= "space-y-8" >
        {/* Header */ }
        < div className = "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" >
            <div>
            <h1 className="text-3xl font-bold tracking-tight" >
                Bienvenido, { user?.full_name?.split(' ')[0] || 'Usuario' }
                </h1>
                < p className = "text-muted-foreground" >
                    Aquí está el resumen de tus proyectos solares
                        </p>
                        </div>
                        < Link href = "/projects/new" >
                            <Button>
                            <Plus className="mr-2 h-4 w-4" />
                                Nuevo Proyecto
                                    </Button>
                                    </Link>
                                    </div>

    {/* Stats Grid */ }
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
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

{/* Recent Projects */ }
<Card>
    <CardHeader>
    <div className="flex items-center justify-between" >
        <div>
        <CardTitle>Proyectos Recientes </CardTitle>
            <CardDescription>
                Tus últimos proyectos de diseño solar
    </CardDescription>
    </div>
    < Link href = "/projects" >
        <Button variant="ghost" size = "sm" >
            Ver todos
                < ArrowRight className = "ml-2 h-4 w-4" />
                    </Button>
                    </Link>
                    </div>
                    </CardHeader>
                    < CardContent >
                    <div className="space-y-4" >
                        {
                            recentProjects.map((project) => (
                                <div
                key= { project.id }
                className = "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                <div className="flex-1" >
                            <h3 className="font-semibold" > { project.name } </h3>
                            < div className = "flex items-center gap-4 mt-1 text-sm text-muted-foreground" >
                            <span>{ project.location } </span>
                            <span>•</span>
                            < span > { project.capacity } </span>
                            <span>•</span>
                            < span className = "flex items-center gap-1" >
                            <Activity className="h-3 w-3" />
                            { project.status }
                            </span>
                            </div>
                            </div>
                            < div className = "flex items-center gap-4" >
                            <div className="w-32" >
                            <div className="flex justify-between text-sm mb-1" >
                            <span className="text-muted-foreground" > Progreso </span>
                            < span className = "font-medium" > { project.progress } % </span>
                            </div>
                            < div className = "w-full bg-gray-200 rounded-full h-2" >
                            <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style = {{ width: `${project.progress}%` }}
                        />
                        </div>
                        </div>
                        < Link href = {`/projects/${project.id}`}>
                            <Button variant="ghost" size = "sm" >
                                <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    </Link>
                                    </div>
                                    </div>
            ))}
</div>
    </CardContent>
    </Card>
    </div>
  );
}