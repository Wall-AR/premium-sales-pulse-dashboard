import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { signUp } from '../lib/auth'; // Assuming this path is correct

export const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await signUp({ email, password });

    setLoading(false);
    if (authError) {
      setError(authError.message); // Keep other potential Supabase errors as is, or map them
    } else if (data.user) {
      // data.user.identities?.length === 0 can indicate email already exists without confirmed email
      if (data.user.identities && data.user.identities.length === 0) {
         setError("Usuário já existe. Por favor, tente fazer login ou use um e-mail diferente.");
      } else {
        // On successful signup, Supabase sends a confirmation email.
        // You might want to navigate to a page saying "Please check your email"
        // or directly to login, or dashboard if auto-login is configured (depends on Supabase settings)
        alert('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.'); 
        navigate('/login'); 
      }
    } else {
      // Handle cases where user might be null but no error (e.g. email confirmation required)
      // Supabase default behavior is to return a user object if sign up is successful,
      // then requiring email confirmation.
      alert('Cadastro iniciado! Por favor, verifique seu e-mail para confirmar sua conta.');
      navigate('/login');
    }
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
          <CardTitle className="text-2xl font-bold text-emerald-700">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para acessar seu painel NutraManager.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
