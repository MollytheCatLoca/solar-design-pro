'use client';

const React = require('react');
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schemas';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, loginMutation } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login({
      username: data.email, // El backend espera 'username'
      password: data.password,
    });
  };

  return (
    <Card className= "w-full max-w-md" >
    <CardHeader className="space-y-1" >
      <CardTitle className="text-2xl font-bold" > Iniciar Sesión </CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
    </CardDescription>
    </CardHeader>
    < form onSubmit = { handleSubmit(onSubmit) } >
      <CardContent className="space-y-4" >
        <div className="space-y-2" >
          <Label htmlFor="email" > Email </Label>
            < div className = "relative" >
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                id="email"
  type = "email"
  placeholder = "tu@email.com"
  className = "pl-10"
  disabled = { loginMutation.isLoading }
  {...register('email') }
              />
    </div>
  {
    errors.email && (
      <p className="text-sm text-destructive" > { errors.email.message } </p>
            )
  }
  </div>

    < div className = "space-y-2" >
      <Label htmlFor="password" > Contraseña </Label>
        < div className = "relative" >
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                id="password"
  type = { showPassword? 'text': 'password' }
  placeholder = "••••••••"
  className = "pl-10 pr-10"
  disabled = { loginMutation.isLoading }
  {...register('password') }
              />
    < button
  type = "button"
  onClick = {() => setShowPassword(!showPassword)
}
className = "absolute right-3 top-3 text-muted-foreground hover:text-foreground"
tabIndex = {- 1}
              >
  {
    showPassword?(
                  <EyeOff className = "h-4 w-4" />
                ): (
        <Eye className = "h-4 w-4" />
                )}
</button>
  </div>
{
  errors.password && (
    <p className="text-sm text-destructive" > { errors.password.message } </p>
            )
}
</div>

  < div className = "flex items-center justify-between" >
    <Link
              href="/forgot-password"
className = "text-sm text-primary hover:underline"
  >
              ¿Olvidaste tu contraseña ?
  </Link>
  </div>
  </CardContent>

  < CardFooter className = "flex flex-col space-y-4" >
    <Button
            type="submit"
className = "w-full"
disabled = { loginMutation.isLoading }
  >
  {
    loginMutation.isLoading ? (
      <>
      <Loader2 className= "mr-2 h-4 w-4 animate-spin" />
      Iniciando sesión...
    </>
            ) : (
      'Iniciar Sesión'
    )}
</Button>

  < div className = "text-center text-sm text-muted-foreground" >
            ¿No tienes cuenta ? { ' '}
  < Link href = "/register" className = "text-primary hover:underline" >
    Regístrate aquí
      </Link>
      </div>
      </CardFooter>
      </form>
      </Card>
  );
}