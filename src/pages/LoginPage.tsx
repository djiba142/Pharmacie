import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';
import logoMshp from '@/assets/partners/mshp.png';
import logoOms from '@/assets/partners/oms.png';
import logoUsaid from '@/assets/partners/usaid.jpg';
import logoUnicef from '@/assets/partners/unicef.jpg';
import logoGavi from '@/assets/partners/gavi.png';
import logoFondsMondial from '@/assets/partners/fonds-mondial.jpg';
import logoPcg from '@/assets/partners/pcg.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        const result = await signup(email, password, firstName, lastName);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Erreur lors de l\'inscription');
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Email ou mot de passe incorrect');
        }
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const partners = [logoOms, logoUsaid, logoUnicef, logoGavi, logoFondsMondial, logoPcg];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 login-gradient relative flex-col justify-between p-12">
        <div className="relative z-10">
          <img src={logoLivramed} alt="LivraMed" className="h-16 w-16 rounded-xl" />
          <h1 className="mt-8 text-4xl font-display font-bold text-primary-foreground leading-tight">
            Plateforme Nationale de Gestion des Médicaments
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-md">
            Système intégré de gestion, suivi et distribution pharmaceutique pour la République de Guinée.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <img src={logoMshp} alt="MSHP" className="h-14 w-14 rounded-full bg-primary-foreground p-1 object-contain" />
            <div>
              <p className="text-primary-foreground font-semibold text-sm">Ministère de la Santé et de l'Hygiène Publique</p>
              <p className="text-primary-foreground/60 text-xs">République de Guinée</p>
            </div>
          </div>

          <div>
            <p className="text-primary-foreground/50 text-xs uppercase tracking-wider mb-3">Partenaires</p>
            <div className="flex items-center gap-3 flex-wrap">
              {partners.map((logo, i) => (
                <div key={i} className="h-10 w-16 bg-primary-foreground/90 rounded-md flex items-center justify-center p-1.5">
                  <img src={logo} alt="Partenaire" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-primary-foreground/5 translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center">
            <img src={logoLivramed} alt="LivraMed" className="h-14 w-14 rounded-xl" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isSignup ? 'Créer un compte' : 'Connexion'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignup ? 'Remplissez les informations ci-dessous' : 'Accédez à votre espace de gestion'}
            </p>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="firstName" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="votre.email@sante.gov.gn" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Chargement...' : isSignup ? 'Créer le compte' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-sm text-primary hover:underline">
                  {isSignup ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Information</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Les comptes utilisateurs sont créés par les administrateurs. Contactez votre administrateur pour obtenir vos identifiants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
