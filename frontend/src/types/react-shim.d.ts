// src/types/react-shim.d.ts

import * as React from 'react';

declare global {
    // Re-exportar todo de React en el namespace global
    const useState: typeof React.useState;
    const useEffect: typeof React.useEffect;
    const useCallback: typeof React.useCallback;
    const useMemo: typeof React.useMemo;
    const useRef: typeof React.useRef;
    const useContext: typeof React.useContext;
    const useReducer: typeof React.useReducer;
    const useLayoutEffect: typeof React.useLayoutEffect;
    const useImperativeHandle: typeof React.useImperativeHandle;
    const useDebugValue: typeof React.useDebugValue;
    const Fragment: typeof React.Fragment;
    const StrictMode: typeof React.StrictMode;
    const Suspense: typeof React.Suspense;
    const createElement: typeof React.createElement;
    const cloneElement: typeof React.cloneElement;
    const createContext: typeof React.createContext;
    const forwardRef: typeof React.forwardRef;
    const lazy: typeof React.lazy;
    const memo: typeof React.memo;
}

export { };