import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logoLivramed from '@/assets/logo-livramed.png';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validatePassword = (pwd: string): string[] => {
        const errors: string[] = [];
        if (pwd.length < 12) errors.push('Au moins 12 caractères');
        if (!/[A-Z]/.test(pwd)) errors.push('Au moins une majuscule');
        if (!/[a-z]/.test(pwd)) errors.push('Au moins une minuscule');
        if (!/[0-9]/.test(pwd)) errors.push('Au moins un chiffre');
        return errors;
    };

    const passwordErrors = password ? validatePassword(password) : [];
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passwordErrors.length > 0) {
            setError('Le mot de passe ne respecte pas les critères de sécurité');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            toast({
                title: 'Mot de passe réinitialisé',
                description: 'Votre mot de passe a été changé avec succès',
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Erreur lors de la réinitialisation');
            toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-8 w-8 text-success" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Succès !</h2>
                            <p className="text-muted-foreground mt-2">
                                Votre mot de passe a été réinitialisé. Redirection vers la page de connexion...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <img src={logoLivramed} alt="LivraMed" className="h-14 w-14 rounded-xl mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-foreground">Nouveau mot de passe</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choisissez un mot de passe sécurisé
                    </p>
                </div>

                <Card className="border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nouveau mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {password && passwordErrors.length > 0 && (
                                    <div className="text-xs space-y-1">
                                        {passwordErrors.map((err, idx) => (
                                            <p key={idx} className="text-destructive">❌ {err}</p>
                                        ))}
                                    </div>
                                )}
                                {password && passwordErrors.length === 0 && (
                                    <p className="text-xs text-success">✅ Mot de passe valide</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && !passwordsMatch && (
                                    <p className="text-xs text-destructive">❌ Les mots de passe ne correspondent pas</p>
                                )}
                                {confirmPassword && passwordsMatch && (
                                    <p className="text-xs text-success">✅ Les mots de passe correspondent</p>
                                )}
                            </div>

                            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
                                <p className="font-semibold mb-1">Critères de sécurité :</p>
                                <ul className="space-y-0.5">
                                    <li>• Minimum 12 caractères</li>
                                    <li>• Au moins une majuscule (A-Z)</li>
                                    <li>• Au moins une minuscule (a-z)</li>
                                    <li>• Au moins un chiffre (0-9)</li>
                                </ul>
                            </div>

                            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || passwordErrors.length > 0 || !passwordsMatch}
                            >
                                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                ← Retour à la connexion
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
