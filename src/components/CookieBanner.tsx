import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';
import { cookieService } from '@/services/cookieService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true,
        performance: false,
        functional: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        // Vérifier si le consentement a déjà été donné
        const hasConsent = cookieService.hasConsent();
        setIsVisible(!hasConsent);

        // Charger les préférences existantes
        const existing = cookieService.getLocalPreferences();
        if (existing) {
            setPreferences(existing);
        }
    }, []);

    // Synchroniser avec le backend au login
    useEffect(() => {
        if (user?.id) {
            const syncCookies = async () => {
                try {
                    const backendPrefs = await cookieService.loadFromBackend(user.id);
                    if (backendPrefs) {
                        setPreferences(backendPrefs);
                    }
                } catch (error) {
                    // Silently fail on backend sync - local storage is fallback
                }
            };
            syncCookies();
        }
    }, [user?.id]);

    const handleAcceptAll = async () => {
        try {
            setIsLoading(true);
            await cookieService.acceptAll();
            toast.success('✅ Tous les cookies ont été acceptés');
            setIsVisible(false);
        } catch (error) {
            toast.error('Erreur lors de l\'acceptation des cookies');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectAll = async () => {
        try {
            setIsLoading(true);
            await cookieService.rejectAll();
            toast.success('❌ Les cookies non-nécessaires ont été refusés');
            setIsVisible(false);
        } catch (error) {
            toast.error('Erreur lors du refus des cookies');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        try {
            setIsLoading(true);
            await cookieService.savePreferences(preferences);
            toast.success('💾 Vos préférences de cookies ont été enregistrées');
            setIsVisible(false);
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement des préférences');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
            <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                🍪 Nous utilisons des cookies
                            </h3>

                            {!showDetails ? (
                                <>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Nous utilisons des cookies pour améliorer votre expérience sur LivraMed.
                                        Les cookies strictement nécessaires sont toujours activés.
                                        Vous pouvez personnaliser vos préférences ou tout accepter/refuser.
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={handleAcceptAll} size="sm">
                                            ✅ Tout accepter
                                        </Button>
                                        <Button onClick={handleRejectAll} variant="outline" size="sm">
                                            ❌ Tout refuser
                                        </Button>
                                        <Button
                                            onClick={() => setShowDetails(true)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Personnaliser
                                        </Button>
                                        <Button
                                            onClick={() => window.open('/cookies', '_blank')}
                                            variant="link"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            En savoir plus
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Choisissez les cookies que vous souhaitez autoriser :
                                    </p>

                                    <div className="space-y-3 mb-4">
                                        {/* Cookies nécessaires */}
                                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                disabled
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Cookies strictement nécessaires</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Essentiels au fonctionnement du site (session, authentification)
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cookies de performance */}
                                        <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                                            <input
                                                type="checkbox"
                                                checked={preferences.performance}
                                                onChange={(e) => setPreferences(prev => ({
                                                    ...prev,
                                                    performance: e.target.checked
                                                }))}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Cookies de performance</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Nous aident à comprendre comment vous utilisez le site (Google Analytics)
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cookies fonctionnels */}
                                        <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                                            <input
                                                type="checkbox"
                                                checked={preferences.functional}
                                                onChange={(e) => setPreferences(prev => ({
                                                    ...prev,
                                                    functional: e.target.checked
                                                }))}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Cookies fonctionnels</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Mémorisent vos préférences (filtres, affichage, langue)
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={handleSavePreferences} size="sm">
                                            💾 Enregistrer mes choix
                                        </Button>
                                        <Button
                                            onClick={() => setShowDetails(false)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Retour
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={handleRejectAll}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
