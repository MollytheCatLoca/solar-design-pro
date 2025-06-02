// src/components/projects/ProjectFormModal.tsx

'use client';

const React = require('react');
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin } from 'lucide-react';
import { Project } from '@/lib/api/projects';

const projectSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
    description: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional().or(z.string().transform(val => val ? parseFloat(val) : undefined)),
    longitude: z.number().min(-180).max(180).optional().or(z.string().transform(val => val ? parseFloat(val) : undefined)),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => void;
    project?: Project | null;
    isLoading?: boolean;
}

export default function ProjectFormModal({
    isOpen,
    onClose,
    onSubmit,
    project,
    isLoading = false,
}: ProjectFormModalProps) {
    const [showMap, setShowMap] = React.useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: project?.name || '',
            description: project?.description || '',
            latitude: project?.latitude || undefined,
            longitude: project?.longitude || undefined,
        },
    });

    React.useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                description: project.description || '',
                latitude: project.latitude || undefined,
                longitude: project.longitude || undefined,
            });
        } else {
            reset({
                name: '',
                description: '',
                latitude: undefined,
                longitude: undefined,
            });
        }
    }, [project, reset]);

    const handleFormSubmit = (data: ProjectFormData) => {
        onSubmit(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Función para obtener ubicación actual
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue('latitude', position.coords.latitude);
                    setValue('longitude', position.coords.longitude);
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error);
                }
            );
        }
    };

    return (
        <Dialog open= { isOpen } onOpenChange = { handleClose } >
            <DialogContent className="sm:max-w-[500px]" >
                <form onSubmit={ handleSubmit(handleFormSubmit) }>
                    <DialogHeader>
                    <DialogTitle>
                    { project? 'Editar Proyecto': 'Nuevo Proyecto' }
                    </DialogTitle>
                    <DialogDescription>
    {
        project
            ? 'Modifica los datos del proyecto solar.'
            : 'Crea un nuevo proyecto solar ingresando la información básica.'
    }
    </DialogDescription>
        </DialogHeader>

        < div className = "grid gap-4 py-4" >
            <div className="space-y-2" >
                <Label htmlFor="name" > Nombre del proyecto * </Label>
                    < Input
    id = "name"
    placeholder = "Ej: Planta Solar Norte"
    {...register('name') }
    disabled = { isLoading }
        />
    {
        errors.name && (
            <p className="text-sm text-destructive"> { errors.name.message } </p>
              )
    }
        </div>

        < div className = "space-y-2" >
            <Label htmlFor="description" > Descripción </Label>
                < Textarea
    id = "description"
    placeholder = "Describe el proyecto..."
    rows = { 3}
    {...register('description') }
    disabled = { isLoading }
        />
    {
        errors.description && (
            <p className="text-sm text-destructive"> { errors.description.message } </p>
              )
    }
        </div>

        < div className = "space-y-2" >
            <div className="flex items-center justify-between" >
                <Label>Ubicación(opcional) </Label>
                < Button
    type = "button"
    variant = "ghost"
    size = "sm"
    onClick = { getCurrentLocation }
    disabled = { isLoading }
        >
        <MapPin className="mr-2 h-4 w-4" />
            Usar mi ubicación
                </Button>
                </div>

                < div className = "grid grid-cols-2 gap-2" >
                    <div>
                    <Input
                    type="number"
    step = "any"
    placeholder = "Latitud"
    {...register('latitude') }
    disabled = { isLoading }
        />
    {
        errors.latitude && (
            <p className="text-sm text-destructive"> { errors.latitude.message } </p>
                  )
    }
        </div>
        < div >
        <Input
                    type="number"
    step = "any"
    placeholder = "Longitud"
    {...register('longitude') }
    disabled = { isLoading }
        />
    {
        errors.longitude && (
            <p className="text-sm text-destructive"> { errors.longitude.message } </p>
                  )
    }
        </div>
        </div>
        </div>
        </div>

        < DialogFooter >
        <Button
              type="button"
    variant = "outline"
    onClick = { handleClose }
    disabled = { isLoading }
        >
        Cancelar
        </Button>
        < Button type = "submit" disabled = { isLoading } >
        {
            isLoading?(
                <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                { project? 'Actualizando...': 'Creando...' }
                </>
              ) : (
        project ? 'Actualizar' : 'Crear proyecto'
    )
}
</Button>
    </DialogFooter>
    </form>
    </DialogContent>
    </Dialog>
  );
}