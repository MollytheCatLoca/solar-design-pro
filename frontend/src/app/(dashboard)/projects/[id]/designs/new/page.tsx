// src/app/(dashboard)/projects/[id]/designs/new/page.tsx

'use client';

const React = require('react');
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { toast } from 'sonner';
import DesignMap from '@/components/design/DesignMap';
import ModuleConfigurator from '@/components/design/ModuleConfigurator';
import DesignMetrics from '@/components/design/DesignMetrics';

export default function NewDesignPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);

    const [designName, setDesignName] = React.useState('Diseño 1');
    const [polygons, setPolygons] = React.useState<any[]>([]);
    const [selectedModule, setSelectedModule] = React.useState(null);
    const [designConfig, setDesignConfig] = React.useState({
        tiltAngle: 25,
        azimuthAngle: 180,
        rowSpacing: 5,
        moduleOrientation: 'landscape',
        setback: 10,
    });

    const handleSave = () => {
        // TODO: Implementar guardado en el backend
        toast.success('Diseño guardado');
        router.push(`/projects/${projectId}`);
    };

    const handleSimulate = () => {
        // TODO: Implementar simulación
        toast.info('Simulación iniciada...');
    };

    const totalCapacity = polygons.reduce((sum, polygon) => sum + (polygon.capacity || 0), 0);
    const totalArea = polygons.reduce((sum, polygon) => sum + (polygon.area || 0), 0);
    const estimatedPanels = Math.floor(totalArea / 2.5); // Estimación simple

    return (
        <div className= "h-[calc(100vh-4rem)] flex flex-col" >
        {/* Header */ }
        < div className = "flex items-center justify-between p-4 border-b" >
            <div className="flex items-center gap-4" >
                <Link href={ `/projects/${projectId}` }>
                    <Button variant="ghost" size = "icon" >
                        <ArrowLeft className="h-4 w-4" />
                            </Button>
                            </Link>
                            < div className = "flex items-center gap-2" >
                                <Input
              value={ designName }
    onChange = {(e) => setDesignName(e.target.value)
}
className = "w-48"
    />
    <span className="text-sm text-muted-foreground" >
        Proyecto #{ projectId }
</span>
    </div>
    </div>
    < div className = "flex items-center gap-2" >
        <Button variant="outline" onClick = { handleSave } >
            <Save className="mr-2 h-4 w-4" />
                Guardar
                </Button>
                < Button onClick = { handleSimulate } >
                    <Play className="mr-2 h-4 w-4" />
                        Simular
                        </Button>
                        </div>
                        </div>

{/* Main Content */ }
<div className="flex-1 flex" >
    {/* Map Area */ }
    < div className = "flex-1 relative" >
        <DesignMap
            projectId={ projectId }
polygons = { polygons }
onPolygonsChange = { setPolygons }
    />
    </div>

{/* Side Panel */ }
<div className="w-96 border-l bg-background overflow-y-auto" >
    <Tabs defaultValue="design" className = "h-full" >
        <TabsList className="w-full rounded-none" >
            <TabsTrigger value="design" className = "flex-1" > Diseño </TabsTrigger>
                < TabsTrigger value = "electrical" className = "flex-1" > Eléctrico </TabsTrigger>
                    < TabsTrigger value = "metrics" className = "flex-1" > Métricas </TabsTrigger>
                        </TabsList>

                        < TabsContent value = "design" className = "p-4 space-y-4" >
                            <ModuleConfigurator
                selectedModule={ selectedModule }
onModuleChange = { setSelectedModule }
config = { designConfig }
onConfigChange = { setDesignConfig }
    />
    </TabsContent>

    < TabsContent value = "electrical" className = "p-4" >
        <Card>
        <CardHeader>
        <CardTitle>Configuración Eléctrica </CardTitle>
            </CardHeader>
            < CardContent >
            <p className="text-sm text-muted-foreground" >
                Próximamente: Configuración de strings e inversores
                    </p>
                    </CardContent>
                    </Card>
                    </TabsContent>

                    < TabsContent value = "metrics" className = "p-4" >
                        <DesignMetrics
                totalCapacity={ totalCapacity }
totalArea = { totalArea }
estimatedPanels = { estimatedPanels }
polygonCount = { polygons.length }
    />
    </TabsContent>
    </Tabs>
    </div>
    </div>
    </div>
  );
}