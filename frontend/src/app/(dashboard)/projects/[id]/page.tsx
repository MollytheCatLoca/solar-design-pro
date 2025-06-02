// src/app/(dashboard)/projects/[id]/page.tsx

'use client';

const React = require('react');
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useProject, useProjects } from '@/lib/hooks/useProjects';
import ProjectInfo from '@/components/projects/ProjectInfo';
import ProjectStats from '@/components/projects/ProjectStats';
import ProjectMap from '@/components/projects/ProjectMap';
import ProjectDesignsTable from '@/components/projects/ProjectDesignsTable';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    const { project, isLoading, error } = useProject(projectId);
    const { updateProject, deleteProject, isUpdating, isDeleting } = useProjects();

    if (isLoading) {
        return (
            <div className= "space-y-6" >
            <div className="flex items-center gap-4" >
                <Skeleton className="h-10 w-10" />
                    <div className="space-y-2" >
                        <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-96" />
                                </div>
                                </div>
                                < div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
                                {
                                    [...Array(4)].map((_, i) => (
                                        <Skeleton key= { i } className = "h-32" />
          ))
                                }
                                    </div>
                                    < div className = "grid gap-6 lg:grid-cols-2" >
                                        <Skeleton className="h-96" />
                                            <Skeleton className="h-96" />
                                                </div>
                                                </div>
    );
    }

    if (error || !project) {
        return (
            <div className= "text-center py-12" >
            <h2 className="text-2xl font-semibold mb-2" > Proyecto no encontrado </h2>
                < p className = "text-muted-foreground mb-4" >
                    El proyecto que buscas no existe o ha sido eliminado.
        </p>
                        < Link href = "/projects" >
                            <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a proyectos
                                    </Button>
                                    </Link>
                                    </div>
    );
    }

    const handleUpdate = (data: any) => {
        updateProject(
            { id: projectId, data },
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    toast.success('Proyecto actualizado');
                },
            }
        );
    };

    const handleDelete = () => {
        deleteProject(projectId, {
            onSuccess: () => {
                toast.success('Proyecto eliminado');
                router.push('/projects');
            },
        });
    };

    // Datos mock para las estadísticas (después los obtendremos del API)
    const stats = {
        designsCount: 2,
        totalCapacity: 2.8,
        estimatedProduction: 4.2,
        totalInvestment: 3.5,
    };

    return (
        <div className= "space-y-6" >
        {/* Header */ }
        < div className = "flex items-center justify-between" >
            <div className="flex items-center gap-4" >
                <Link href="/projects" >
                    <Button variant="ghost" size = "icon" >
                        <ArrowLeft className="h-4 w-4" />
                            </Button>
                            </Link>
                            < div >
                            <h1 className="text-3xl font-bold tracking-tight" > { project.name } </h1>
                                < p className = "text-muted-foreground" >
                                    Gestiona y visualiza los detalles de tu proyecto solar
                                        </p>
                                        </div>
                                        </div>
                                        < DropdownMenu >
                                        <DropdownMenuTrigger asChild >
                                        <Button variant="outline" >
                                            <MoreVertical className="mr-2 h-4 w-4" />
                                                Opciones
                                                </Button>
                                                </DropdownMenuTrigger>
                                                < DropdownMenuContent align = "end" >
                                                    <DropdownMenuItem onClick={ () => setIsEditModalOpen(true) }>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                            Editar proyecto
                                                                </DropdownMenuItem>
                                                                < DropdownMenuSeparator />
                                                                <DropdownMenuItem 
              onClick={ () => setShowDeleteDialog(true) }
    className = "text-red-600"
        >
        <Trash2 className="mr-2 h-4 w-4" />
            Eliminar proyecto
                </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                </div>

    {/* Stats */ }
    <ProjectStats { ...stats } />

        {/* Info and Map Grid */ }
        < div className = "grid gap-6 lg:grid-cols-2" >
            <ProjectInfo project={ project } />
    {
        project.latitude && project.longitude && (
            <ProjectMap
            latitude={ project.latitude }
        longitude = { project.longitude }
        projectName = { project.name }
            />
        )
    }
    </div>

    {/* Designs Table */ }
    <ProjectDesignsTable projectId={ projectId } />

    {/* Edit Modal */ }
    <ProjectFormModal
        isOpen={ isEditModalOpen }
    onClose = {() => setIsEditModalOpen(false)
}
onSubmit = { handleUpdate }
project = { project }
isLoading = { isUpdating }
    />

    {/* Delete Dialog */ }
    < AlertDialog open = { showDeleteDialog } onOpenChange = { setShowDeleteDialog } >
        <AlertDialogContent>
        <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar proyecto ? </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.Se eliminará permanentemente el proyecto
"{project.name}" y todos sus diseños asociados.
            </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel>Cancelar </AlertDialogCancel>
    < AlertDialogAction
onClick = { handleDelete }
className = "bg-red-600 hover:bg-red-700"
disabled = { isDeleting }
    >
    { isDeleting? 'Eliminando...': 'Eliminar' }
    </AlertDialogAction>
    </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}