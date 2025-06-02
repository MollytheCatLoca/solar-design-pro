// src/components/layout/Sidebar.tsx
'use client';
import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sun,
    Home,
    FolderOpen,
    Cpu,
    Settings,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Proyectos', href: '/projects', icon: FolderOpen },
    { name: 'Componentes', href: '/components', icon: Cpu },
    { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
        {/* Mobile sidebar toggle */ }
        < div className = "lg:hidden fixed top-4 left-4 z-50" >
            <Button
          variant="outline"
    size = "icon"
    onClick = {() => setSidebarOpen(!sidebarOpen)
}
        >
    { sidebarOpen?<X className = "h-5 w-5" /> : <Menu className="h-5 w-5" />}
</Button>
    </div>

{/* Mobile sidebar backdrop */ }
{
    sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
    onClick = {() => setSidebarOpen(false)
}
        />
      )}

{/* Sidebar */ }
<div
        className={
    cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )
}
      >
    {/* Logo */ }
    < div className = "flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800" >
        <Link href="/" className = "flex items-center space-x-2" >
            <Sun className="h-8 w-8 text-amber-600 flex-shrink-0" />
                {!collapsed && (
                    <span className="text-xl font-bold text-gray-900 dark:text-white" >
                        SolarDesignPro
                        </span>
            )}
</Link>
    < Button
variant = "ghost"
size = "icon"
className = "hidden lg:flex"
onClick = {() => setCollapsed(!collapsed)}
          >
    <ChevronLeft className={
    cn(
        "h-4 w-4 transition-transform",
        collapsed && "rotate-180"
    )
} />
    </Button>
    </div>

{/* Navigation */ }
<nav className="flex-1 overflow-y-auto p-4" >
    <ul className="space-y-2" >
    {
        navigation.map((item) => {
            const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

            return (
                <li key= { item.name } >
                <Link
                    href={ item.href }
            className = {
                cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    collapsed && "justify-center"
                    )
    }
onClick = {() => setSidebarOpen(false)}
                  >
    <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span>{ item.name } </span>}
</Link>
    </li>
              );
            })}
</ul>
    </nav>

{/* Footer */ }
<div className="border-t border-gray-200 dark:border-gray-800 p-4" >
    <div className={
    cn(
        "text-xs text-gray-500 dark:text-gray-400",
        collapsed && "text-center"
    )
}>
    { collapsed? "v0.1": "Version 0.1.0" }
    </div>
    </div>
    </div>
    </>
  );
}