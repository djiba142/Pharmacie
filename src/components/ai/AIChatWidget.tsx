import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, User, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import type { AIMessage, FAQItem } from '@/types/ai';

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [faqData, setFaqData] = useState<FAQItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { toast } = useToast();

    const WELCOME_MESSAGE = '👋 Bonjour ! Je suis l\'assistant IA de LivraMed. Comment puis-je vous aider aujourd\'hui ?';
    const STORAGE_KEY = 'livramed_chat_history';
    const TYPING_DELAY_MS = 500;

    // Charger la FAQ au démarrage
    useEffect(() => {
        const loadFAQ = async () => {
            try {
                setIsLoading(true);
                const response = await aiService.getFAQ();
                if (response.success && response.data) {
                    setFaqData(response.data);
                } else {
                    // Fallback: FAQ vide est acceptable
                }
            } catch (err) {
                // Fallback silently if FAQ loading fails
            } finally {
                setIsLoading(false);
            }
        };

        loadFAQ();
    }, []);

    // Charger l'historique depuis localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
            } catch (e) {
                // Fallback: Initialize with welcome message on parse error
                setMessages([{
                    id: '1',
                    text: WELCOME_MESSAGE,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
            }
        } else {
            // Message de bienvenue initial
            setMessages([{
                id: '1',
                text: WELCOME_MESSAGE,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, []);

    // Nettoyer au logout
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.removeItem(STORAGE_KEY);
            setMessages([{
                id: '1',
                text: WELCOME_MESSAGE,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [isAuthenticated]);

    // Sauvegarder les messages dans localStorage
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            } catch (err) {
                // Silently fail on save, data is not critical
            }
        }
    }, [messages]);

    // Auto-scroll vers le bas
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }, 0);
            }
        }
    }, [messages, isTyping]);

    // Chercher la meilleure réponse FAQ
    const findBestMatch = useCallback((query: string) => {
        const match = aiService.findBestFAQMatch(query, faqData);
        if (match.match) {
            return {
                response: `**${match.match.question}**\n\n${match.match.answer}`,
                matchedId: match.match.id,
                confidence: Math.min(match.score / 50, 1.0)
            };
        }

        return {
            response: 'Je suis désolé, je n\'ai pas trouvé de réponse précise. Vous pouvez:\n\n1. **Consulter la FAQ complète**: Menu → Documentation\n2. **Contacter le support**: support@livramed.sante.gov.gn\n3. **Appeler**: +224 622 345 678\n\nDécrivez-moi plus précisément votre question, je peux peut-être aider davantage.',
            matchedId: null,
            confidence: 0
        };
    }, [faqData]);

    // Envoyer un message
    const handleSend = useCallback(async () => {
        if (!inputValue.trim() || isTyping) return;

        try {
            setError(null);

            const userMessage: AIMessage = {
                id: Date.now().toString(),
                text: inputValue,
                sender: 'user',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            const question = inputValue;
            setInputValue('');
            setIsTyping(true);

            // Penser et répondre avec délai réaliste
            await new Promise(resolve => setTimeout(resolve, TYPING_DELAY_MS));

            const { response, matchedId, confidence } = findBestMatch(question);
            const botResponse: AIMessage = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'bot',
                timestamp: new Date(),
                feedback: null,
                userQuestion: question,
                confidence
            };

            setMessages(prev => [...prev, botResponse]);

            // Sauvegarder en arrière-plan (non-bloquant)
            aiService.saveChatInteraction(
                user?.id || null,
                question,
                response,
                null,
                matchedId
            ).catch(err => {
                // Silent fallback: chat interaction not saved but conversation continues
            });
        } catch (err) {
            setError('Une erreur s\'est produit. Veuillez réessayer.');
            toast({
                title: 'Erreur',
                description: 'Une erreur s\'est produit lors de la réponse',
                variant: 'destructive'
            });
        } finally {
            setIsTyping(false);
        }
    }, [inputValue, isTyping, user?.id, findBestMatch, toast]);

    // Sauvegarder le feedback
    const handleFeedback = useCallback(async (messageId: string, feedbackValue: 1 | -1) => {
        try {
            setError(null);

            // Mettre à jour lokally
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, feedback: feedbackValue } : msg
            ));

            // Trouver le message
            const message = messages.find(m => m.id === messageId);
            if (!message || !message.userQuestion) return;

            // Sauvegarder le feedback (non-bloquant)
            await aiService.saveFeedback(
                user?.id || null,
                message.userQuestion,
                message.text,
                feedbackValue
            );

            toast({
                title: feedbackValue === 1 ? '👍 Merci!' : '📝 Merci pour votre retour',
                description: feedbackValue === -1 ? 'Nous allons améliorer.' : 'Cela nous aide à progresser.'
            });
        } catch (err) {
            toast({
                title: 'Erreur',
                description: 'Impossible de sauvegarder votre feedback',
                variant: 'destructive'
            });
        }
    }, [messages, user?.id, toast]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const isReady = faqData.length > 0;

    return (
        <>
            {/* Bouton flottant */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0 ${!isReady ? 'opacity-50' : ''}`}
                    aria-label="Ouvrir le chat IA"
                    disabled={!isReady}
                    title={!isReady ? "Chargement de l'IA..." : 'Ouvrir le chat'}
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {/* Fenêtre de chat */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isReady ? 'bg-primary/10' : 'bg-yellow-100'}`}>
                                <Bot className={`h-5 w-5 ${isReady ? 'text-primary' : 'text-yellow-600'}`} />
                            </div>
                            <div>
                                <CardTitle className="text-base">Assistant IA</CardTitle>
                                <p className={`text-xs ${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {isReady ? '✅ En ligne' : '⏳ Chargement...'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                        {/* Afficher les messages */}
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {error && (
                                    <div className="flex gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-destructive">{error}</p>
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.sender === 'bot' && (
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-line break-words">{message.text}</p>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <p className="text-[10px] opacity-70">
                                                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {message.sender === 'bot' && message.confidence !== undefined && message.confidence > 0.7 && (
                                                    <span className="text-[9px] text-success">🎯</span>
                                                )}
                                            </div>

                                            {/* Boutons de feedback */}
                                            {message.sender === 'bot' && message.id !== '1' && (
                                                <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                                                    <button
                                                        onClick={() => handleFeedback(message.id, 1)}
                                                        className={`text-xs flex items-center gap-1 hover:text-green-600 transition-colors ${message.feedback === 1 ? 'text-green-600 font-semibold' : 'text-muted-foreground'
                                                            }`}
                                                        title="Réponse utile"
                                                    >
                                                        <ThumbsUp className="h-3 w-3" />
                                                        {message.feedback === 1 && 'Utile'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(message.id, -1)}
                                                        className={`text-xs flex items-center gap-1 hover:text-red-600 transition-colors ${message.feedback === -1 ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                                                            }`}
                                                        title="Réponse non utile"
                                                    >
                                                        <ThumbsDown className="h-3 w-3" />
                                                        {message.feedback === -1 && 'Non'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {message.sender === 'user' && (
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-muted rounded-lg px-4 py-2">
                                            <div className="flex gap-1">
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Entrée */}
                        <div className="p-4 border-t bg-muted/30">
                            {!isReady && (
                                <p className="text-xs text-center text-muted-foreground mb-2">⏳ Chargement de l'IA...</p>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isReady ? "Posez votre question..." : "Chargement..."}
                                    className="flex-1"
                                    disabled={isTyping || !isReady}
                                />
                                <Button
                                    onClick={handleSend}
                                    size="icon"
                                    disabled={!inputValue.trim() || isTyping || !isReady}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                ⚡ IA LivraMed v2.0
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
