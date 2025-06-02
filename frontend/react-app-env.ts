/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // Allow any data-* and aria-* attributes
        [key: string]: any;
    }
}

// Temporary fix for React 19 compatibility issues
declare module '@tanstack/react-query' {
    export const QueryClientProvider: any;
    export const QueryClient: any;
    export const useQuery: any;
    export const useMutation: any;
    export const useQueryClient: any;
}

declare module 'sonner' {
    export const Toaster: any;
    export const toast: any;
}