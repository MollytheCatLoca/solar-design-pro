// src/components/projects/ProjectDesignsTable.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Calendar
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Por ahora usamos datos mock, después integraremos con el API
const mockDesigns = [
    {
        id: 1,
        name: 'Diseño Principal v1',
        version: 1,
        capacity_mw: 2.5,
        status: 'draft',
        created_at: '2024-01-15T10:00:00Z',
        panel_count: 4545,
        inverter_count: 25,
    },
    {
        id: 2,
        name: 'Diseño Optimizado v2',
        version: 2,
        capacity_mw: 2.8,
        status: 'simulated',
        created_at: '2024-01-20T14:30:00Z',
        panel_count: 5090,
        inverter_count: 28,
    },
];

interface ProjectDesignsTableProps {
    projectId: number;
}

export default function ProjectDesignsTable({ projectId }: ProjectDesignsTableProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Borrador', variant: 'secondary' as const },
            simulated: { label: 'Simulado', variant: 'default' as const },
            approved: { label: 'Aprobado', variant: 'default' as const, className: 'bg-green-600' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <Badge variant= { config.variant } className = { config.className } >
                { config.label }
                </Badge>
    );
};

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
    mockDesigns.length === 0 ? (
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
    mockDesigns.map((design) => (
        <TableRow key= { design.id } >
        <TableCell className="font-medium" > { design.name } </TableCell>
        < TableCell > v{ design.version } </TableCell>
        < TableCell > { design.capacity_mw } MW </TableCell>
        < TableCell >
    <div className="text-sm" >
    <div>{ design.panel_count } paneles </div>
    < div className = "text-muted-foreground" > { design.inverter_count } inversores </div>
    </div>
    </TableCell>
    < TableCell > { getStatusBadge(design.status)
} </TableCell>
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
                                < DropdownMenuItem >
                                <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                    </DropdownMenuItem>
                                    < DropdownMenuItem >
                                    <Copy className="mr-2 h-4 w-4" />
                                        Duplicar
                                        </DropdownMenuItem>
                                        < DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" >
                                            Eliminar
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                            </TableCell>
                                            </TableRow>
              ))}
</TableBody>
    </Table>
        )}
</CardContent>
    </Card>
  );
}