// src/components/layout/Navbar.tsx
'use client';

import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
    const { user, logout } = useAuth();

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user?.full_name || user?.email || 'Usuario';
    const displayEmail = user?.email || '';

    return (
        <header className= "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-900 px-6" >
        <div className="flex flex-1 items-center gap-4" >
            {/* Search */ }
            < div className = "relative flex-1 max-w-md" >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
            type="search"
    placeholder = "Buscar proyectos..."
    className = "pl-10 pr-4"
        />
        </div>
        </div>

        < div className = "flex items-center gap-4" >
            {/* Notifications */ }
            < Button variant = "ghost" size = "icon" className = "relative" >
                <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center" >
                        3
                        </span>
                        </Button>

    {/* User Menu */ }
    <DropdownMenu>
        <DropdownMenuTrigger asChild >
        <Button variant="ghost" className = "relative h-10 w-10 rounded-full" >
            <Avatar className="h-10 w-10" >
                <AvatarImage src="/placeholder-avatar.jpg" alt = { displayName } />
                    <AvatarFallback>{ getInitials(displayName) } </AvatarFallback>
                    </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    < DropdownMenuContent className = "w-56" align = "end" forceMount >
                        <DropdownMenuLabel className="font-normal" >
                            <div className="flex flex-col space-y-1" >
                                <p className="text-sm font-medium leading-none" > { displayName } </p>
                                    < p className = "text-xs leading-none text-muted-foreground" >
                                        { displayEmail }
                                        </p>
                                        </div>
                                        </DropdownMenuLabel>
                                        < DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                            <span>Mi Perfil </span>
                                                </DropdownMenuItem>
                                                < DropdownMenuItem >
                                                <Settings className="mr-2 h-4 w-4" />
                                                    <span>Configuración </span>
                                                    </DropdownMenuItem>
                                                    < DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={ logout } className = "text-red-600" >
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                            <span>Cerrar Sesión </span>
                                                                </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                </div>
                                                                </header>
  );
}