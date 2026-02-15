import { Building2, Shield } from 'lucide-react';

export function OfficialHeader() {
    return (
        <div className="official-header bg-gradient-to-r from-gn-red via-gn-yellow to-gn-green p-6 text-white shadow-lg">
            <div className="container mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                            <Shield className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold tracking-tight">
                                République de Guinée
                            </h1>
                            <p className="text-sm font-medium opacity-90 mt-1">
                                Travail • Justice • Solidarité
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                        <Building2 className="h-5 w-5" />
                        <div className="text-right">
                            <p className="text-xs opacity-75">Ministère de la Santé</p>
                            <p className="text-sm font-semibold">Plateforme LivraMed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
