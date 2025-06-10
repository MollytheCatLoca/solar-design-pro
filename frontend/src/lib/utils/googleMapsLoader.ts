// src/lib/utils/googleMapsLoader.ts

class GoogleMapsLoader {
    private static instance: GoogleMapsLoader;
    private loadPromise: Promise<void> | null = null;
    private isLoaded = false;

    private constructor() { }

    static getInstance(): GoogleMapsLoader {
        if (!GoogleMapsLoader.instance) {
            GoogleMapsLoader.instance = new GoogleMapsLoader();
        }
        return GoogleMapsLoader.instance;
    }

    load(): Promise<void> {
        // Si ya está cargado, resolver inmediatamente
        if (this.isLoaded && window.google && window.google.maps) {
            return Promise.resolve();
        }

        // Si ya hay una carga en progreso, retornar esa promesa
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');

        if (existingScript) {
            // Si el script existe, esperar a que se cargue
            this.loadPromise = new Promise((resolve) => {
                if (window.google && window.google.maps) {
                    this.isLoaded = true;
                    resolve();
                } else {
                    existingScript.addEventListener('load', () => {
                        this.isLoaded = true;
                        resolve();
                    });
                }
            });
        } else {
            // Crear nueva promesa de carga
            this.loadPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`;
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    this.isLoaded = true;
                    resolve();
                };

                script.onerror = () => {
                    this.loadPromise = null;
                    reject(new Error('Failed to load Google Maps'));
                };

                document.head.appendChild(script);
            });
        }

        return this.loadPromise;
    }

    isGoogleMapsLoaded(): boolean {
        return this.isLoaded && !!(window.google && window.google.maps);
    }
}

export default GoogleMapsLoader.getInstance();