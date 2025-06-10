// src/components/projects/ProjectDesignsTable.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Eye,
    Edit,
    Copy,
    MoreVertical,
    Zap,
    Calendar,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProjectDesigns, useDesigns } from '@/lib/hooks/useDesigns';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectDesignsTableProps {
    projectId: number;
}

export default function ProjectDesignsTable({ projectId }: ProjectDesignsTableProps) {
    const router = useRouter();
    const { designs, isLoading } = useProjectDesigns(projectId);
    const { deleteDesign, cloneDesign, isDeleting, isCloning } = useDesigns();
    const [designToDelete, setDesignToDelete] = useState<number | null>(null);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Borrador', variant: 'secondary' as const },
            simulated: { label: 'Simulado', variant: 'default' as const },
            optimized: { label: 'Optimizado', variant: 'default' as const, className: 'bg-blue-600' },
            approved: { label: 'Aprobado', variant: 'default' as const, className: 'bg-green-600' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <Badge variant= { config.variant } className = { config.className } >
                { config.label }
                </Badge>
        );
};

const handleDelete = (designId: number) => {
    deleteDesign(designId, {
        onSuccess: () => {
            setDesignToDelete(null);
        }
    });
};

const handleClone = (designId: number) => {
    cloneDesign(designId, {
        onSuccess: (newDesign) => {
            router.push(`/projects/${projectId}/designs/${newDesign.id}`);
        }
    });
};

// Calcular totales de los diseños
const getTotalCapacity = () => {
    if (!designs.length) return 0;

    return designs.reduce((total, design) => {
        const installationArea = design.installation_area as any;
        if (installationArea?.panelLayouts) {
            const layouts = Object.values(installationArea.panelLayouts) as any[];
            return total + layouts.reduce((sum, layout) => sum + (layout.actualCapacityKW || 0), 0);
        }
        return total;
    }, 0);
};

const getTotalPanels = () => {
    if (!designs.length) return 0;

    return designs.reduce((total, design) => {
        const installationArea = design.installation_area as any;
        if (installationArea?.panelLayouts) {
            const layouts = Object.values(installationArea.panelLayouts) as any[];
            return total + layouts.reduce((sum, layout) => sum + (layout.totalPanels || 0), 0);
        }
        return total;
    }, 0);
};

if (isLoading) {
    return (
        <Card>
        <CardHeader>
        <div className= "flex items-center justify-between" >
        <div>
        <CardTitle>Diseños del Proyecto </CardTitle>
            <CardDescription>
                                Gestiona las diferentes versiones del diseño solar
        </CardDescription>
        </div>
        </div>
        </CardHeader>
        < CardContent >
        <div className="space-y-3" >
        {
            [...Array(3)].map((_, i) => (
                <Skeleton key= { i } className = "h-16 w-full" />
                        ))
        }
            </div>
            </CardContent>
            </Card>
        );
}

return (
    <Card>
    <CardHeader>
    <div className= "flex items-center justify-between" >
    <div>
    <CardTitle>Diseños del Proyecto </CardTitle>
        <CardDescription>
                            Gestiona las diferentes versiones del diseño solar
    </CardDescription>
    </div>
    < Link href = {`/projects/${projectId}/designs/new`}>
        <Button>
        <Plus className="mr-2 h-4 w-4" />
            Nuevo Diseño
                </Button>
                </Link>
                </div>
                </CardHeader>
                <CardContent>
{
    designs.length === 0 ? (
        <div className= "text-center py-12" >
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4" >
            <Zap className="h-6 w-6 text-gray-400" />
                </div>
                < h3 className = "text-lg font-semibold mb-2" > No hay diseños aún </h3>
                    < p className = "text-sm text-muted-foreground mb-4" >
                        Crea tu primer diseño solar para este proyecto
                            </p>
                            < Link href = {`/projects/${projectId}/designs/new`
}>
    <Button>
    <Plus className="mr-2 h-4 w-4" />
        Crear Primer Diseño
            </Button>
            </Link>
            </div>
                ) : (
    <>
    <Table>
    <TableHeader>
    <TableRow>
    <TableHead>Nombre </TableHead>
    < TableHead > Versión </TableHead>
    < TableHead > Capacidad </TableHead>
    < TableHead > Componentes </TableHead>
    < TableHead > Estado </TableHead>
    < TableHead > Creado </TableHead>
    < TableHead className = "text-right" > Acciones </TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
{
    designs.map((design) => {
        const installationArea = design.installation_area as any;
        let totalPanels = 0;
        let totalCapacity = 0;

        if (installationArea?.panelLayouts) {
            const layouts = Object.values(installationArea.panelLayouts) as any[];
            totalPanels = layouts.reduce((sum, layout) => sum + (layout.totalPanels || 0), 0);
            totalCapacity = layouts.reduce((sum, layout) => sum + (layout.actualCapacityKW || 0), 0);
        }

        return (
            <TableRow key= { design.id } >
            <TableCell className="font-medium" > { design.name } </TableCell>
                < TableCell > v{ design.version } </TableCell>
                    < TableCell > { totalCapacity.toFixed(1) } kWp </TableCell>
                        < TableCell >
                        <div className="text-sm" >
                            <div>{ totalPanels.toLocaleString() } paneles </div>
        {
            design.inverter_count > 0 && (
                <div className="text-muted-foreground" >
                    { design.inverter_count } inversores
                        </div>
                                                    )
}
</div>
    </TableCell>
    < TableCell > { getStatusBadge(design.status) } </TableCell>
    < TableCell >
    <div className="flex items-center gap-1 text-sm" >
        <Calendar className="h-3 w-3" />
            { format(new Date(design.created_at), 'd MMM', { locale: es })}
</div>
    </TableCell>
    < TableCell className = "text-right" >
        <DropdownMenu>
        <DropdownMenuTrigger asChild >
        <Button variant="ghost" size = "icon" >
            <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                < DropdownMenuContent align = "end" >
                    <Link href={ `/projects/${projectId}/designs/${design.id}` }>
                        <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                                </DropdownMenuItem>
                                </Link>
                                < Link href = {`/projects/${projectId}/designs/${design.id}/edit`}>
                                    <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                        </DropdownMenuItem>
                                        </Link>
                                        < DropdownMenuItem
onClick = {() => handleClone(design.id)}
disabled = { isCloning }
    >
    <Copy className="mr-2 h-4 w-4" />
        Duplicar
        </DropdownMenuItem>
        < DropdownMenuSeparator />
        <DropdownMenuItem 
                                                            className="text-red-600"
onClick = {() => setDesignToDelete(design.id)}
                                                        >
    <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
        </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        </TableCell>
        </TableRow>
                                    );
                                })}
</TableBody>
    </Table>

{/* Resumen total */ }
{
    designs.length > 0 && (
        <div className="mt-4 pt-4 border-t" >
            <div className="flex justify-between text-sm text-muted-foreground" >
                <span>Total de diseños: { designs.length } </span>
                    < span > Capacidad total: { getTotalCapacity().toFixed(1) } kWp </span>
                        < span > Paneles totales: { getTotalPanels().toLocaleString() } </span>
                            </div>
                            </div>
                        )
}
</>
                )}
</CardContent>

{/* Dialog de confirmación de eliminación */ }
<AlertDialog open={ !!designToDelete } onOpenChange = {() => setDesignToDelete(null)}>
    <AlertDialogContent>
    <AlertDialogHeader>
    <AlertDialogTitle>¿Eliminar diseño ? </AlertDialogTitle>
        <AlertDialogDescription>
                            Esta acción no se puede deshacer.Se eliminará permanentemente el diseño
                            y toda su configuración.
                        </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel>Cancelar </AlertDialogCancel>
    < AlertDialogAction
onClick = {() => designToDelete && handleDelete(designToDelete)}
className = "bg-red-600 hover:bg-red-700"
disabled = { isDeleting }
    >
    { isDeleting? 'Eliminando...': 'Eliminar' }
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
    </Card>
    );
}