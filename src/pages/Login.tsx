import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { signIn } from '../lib/auth'; // Assuming this path is correct

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await signIn({ email, password });

    setLoading(false);
    if (authError) {
      if (authError.message === "Invalid login credentials") {
        setError("E-mail ou senha inválidos. Por favor, tente novamente.");
      } else if (authError.message === "Email not confirmed") {
        setError("Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada para o link de confirmação.");
      }
      else {
        setError(authError.message); // Keep other potential Supabase errors as is, or map them
      }
    } else if (data.user) {
      navigate('/'); // Navigate to dashboard or home page on successful login
    }
    // data.session can also be checked if needed
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <img
            src="/lovable-uploads/91053ff3-b80e-46d3-bc7c-59736d93d8dd.png"
            alt="NutraManager Logo"
            className="w-20 h-20 mx-auto mb-4"
          />
          <CardTitle className="text-2xl font-bold text-emerald-700">Bem-vindo(a) de Volta</CardTitle>
          <CardDescription>Faça login em sua conta NutraManager.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
