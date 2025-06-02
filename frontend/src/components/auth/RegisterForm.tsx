'use client';

const React = require('react');
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth.schemas';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { register: registerUser, registerMutation } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    // Asegurarnos de que los campos no sean undefined
    await registerUser({
      email: registerData.email,
      password: registerData.password,
      full_name: registerData.full_name
    });
  };

  return (
    <Card className= "w-full max-w-md" >
    <CardHeader className="space-y-1" >
      <CardTitle className="text-2xl font-bold" > Crear Cuenta </CardTitle>
        <CardDescription>
          Ingresa tus datos para crear una nueva cuenta
    </CardDescription>
    </CardHeader>
    < form onSubmit = { handleSubmit(onSubmit) } >
      <CardContent className="space-y-4" >
        <div className="space-y-2" >
          <Label htmlFor="full_name" > Nombre Completo </Label>
            < div className = "relative" >
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                id="full_name"
  type = "text"
  placeholder = "Juan Pérez"
  className = "pl-10"
  disabled = { registerMutation.isLoading }
  {...register('full_name') }
              />
    </div>
  {
    errors.full_name && (
      <p className="text-sm text-destructive" > { errors.full_name.message } </p>
            )
  }
  </div>

    < div className = "space-y-2" >
      <Label htmlFor="email" > Email </Label>
        < div className = "relative" >
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                id="email"
  type = "email"
  placeholder = "tu@email.com"
  className = "pl-10"
  disabled = { registerMutation.isLoading }
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
  disabled = { registerMutation.isLoading }
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

  < div className = "space-y-2" >
    <Label htmlFor="confirmPassword" > Confirmar Contraseña </Label>
      < div className = "relative" >
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
                id="confirmPassword"
type = { showConfirmPassword? 'text': 'password' }
placeholder = "••••••••"
className = "pl-10 pr-10"
disabled = { registerMutation.isLoading }
{...register('confirmPassword') }
              />
  < button
type = "button"
onClick = {() => setShowConfirmPassword(!showConfirmPassword)}
className = "absolute right-3 top-3 text-muted-foreground hover:text-foreground"
tabIndex = {- 1}
              >
  {
    showConfirmPassword?(
                  <EyeOff className = "h-4 w-4" />
                ): (
        <Eye className = "h-4 w-4" />
                )}
</button>
  </div>
{
  errors.confirmPassword && (
    <p className="text-sm text-destructive" > { errors.confirmPassword.message } </p>
            )
}
</div>
  </CardContent>

  < CardFooter className = "flex flex-col space-y-4" >
    <Button
            type="submit"
className = "w-full"
disabled = { registerMutation.isLoading }
  >
  {
    registerMutation.isLoading ? (
      <>
      <Loader2 className= "mr-2 h-4 w-4 animate-spin" />
      Creando cuenta...
    </>
            ) : (
      'Crear Cuenta'
    )}
</Button>

  < div className = "text-center text-sm text-muted-foreground" >
            ¿Ya tienes cuenta ? { ' '}
  < Link href = "/login" className = "text-primary hover:underline" >
    Inicia sesión aquí
      </Link>
      </div>
      </CardFooter>
      </form>
      </Card>
  );
}