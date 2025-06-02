// src/types/global.d.ts

// Fix para React 19
declare module 'react' {
    interface HTMLAttributes<T> {
        [key: string]: any;
    }
}

// Fix temporal para librerías sin tipos para React 19
declare module '@tanstack/react-query' {
    export * from '@tanstack/react-query/build/legacy/index';
}

declare module 'lucide-react' {
    export * from 'lucide-react/dist/lucide-react';
}