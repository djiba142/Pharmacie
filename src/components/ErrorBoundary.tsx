import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
                            <AlertTriangle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">Oups ! Une erreur est survenue</h1>
                            <p className="text-muted-foreground">
                                L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page ou réessayer plus tard.
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="p-4 bg-muted rounded-md text-left overflow-auto max-h-32 text-xs font-mono">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="gap-2"
                        >
                            <RefreshCw size={16} />
                            Rafraîchir l'application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
