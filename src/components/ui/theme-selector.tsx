import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSelector() {
    const [theme, setThemeState] = useState<string>('light');

    useEffect(() => {
        // Load theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setThemeState(systemTheme);
            applyTheme(systemTheme);
        }
    }, []);

    const applyTheme = (newTheme: string) => {
        const root = document.documentElement;

        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else if (newTheme === 'light') {
            root.classList.remove('dark');
        } else if (newTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            if (systemTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-display font-semibold">Apparence</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Personnalisez l'apparence de l'application
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label>Thème</Label>
                        <RadioGroup value={theme} onValueChange={handleThemeChange} className="grid grid-cols-3 gap-4">
                            <div>
                                <RadioGroupItem
                                    value="light"
                                    id="light"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="light"
                                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Sun className="mb-3 h-6 w-6" />
                                    <span className="text-sm font-medium">Clair</span>
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem
                                    value="dark"
                                    id="dark"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="dark"
                                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Moon className="mb-3 h-6 w-6" />
                                    <span className="text-sm font-medium">Sombre</span>
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem
                                    value="system"
                                    id="system"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="system"
                                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Monitor className="mb-3 h-6 w-6" />
                                    <span className="text-sm font-medium">Système</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            Le thème "Système" s'adapte automatiquement aux préférences de votre système d'exploitation.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
