// src/app/test/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Test de Configuración</h1>
      
      <div className="space-x-2">
        <Button 
          onClick={() => toast.success('¡Éxito! Todo funciona correctamente')}
          variant="default"
        >
          Test Success Toast
        </Button>
        
        <Button 
          onClick={() => toast.error('Error de prueba')}
          variant="destructive"
        >
          Test Error Toast
        </Button>
        
        <Button 
          onClick={() => toast.info('Información de prueba')}
          variant="outline"
        >
          Test Info Toast
        </Button>
      </div>
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="font-semibold">Estado:</h2>
        <p>✅ React Query configurado</p>
        <p>✅ Sonner configurado</p>
        <p>✅ Componentes UI funcionando</p>
      </div>
    </div>
  );
}