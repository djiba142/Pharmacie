import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DrsData {
  id: string;
  nom: string;
  code: string;
  region: string;
  latitude: number;
  longitude: number;
}

// SVG coordinates for Guinea regions (simplified positioning)
const regionPositions: Record<string, { x: number; y: number }> = {
  'Conakry':    { x: 80, y: 230 },
  'Kindia':     { x: 130, y: 195 },
  'Boké':       { x: 75, y: 140 },
  'Mamou':      { x: 180, y: 170 },
  'Labé':       { x: 165, y: 110 },
  'Faranah':    { x: 260, y: 200 },
  'Kankan':     { x: 340, y: 165 },
  'N\'Zérékoré': { x: 290, y: 280 },
};

const mockStats: Record<string, { stocks: number; alertes: number; commandes: number }> = {
  'Conakry':     { stocks: 12450, alertes: 3, commandes: 245 },
  'Kindia':      { stocks: 4200, alertes: 5, commandes: 132 },
  'Boké':        { stocks: 3800, alertes: 2, commandes: 98 },
  'Mamou':       { stocks: 2100, alertes: 4, commandes: 54 },
  'Labé':        { stocks: 2800, alertes: 1, commandes: 76 },
  'Faranah':     { stocks: 1900, alertes: 6, commandes: 65 },
  'Kankan':      { stocks: 3100, alertes: 3, commandes: 87 },
  'N\'Zérékoré': { stocks: 4600, alertes: 7, commandes: 112 },
};

export default function GuineaMap() {
  const [drsData, setDrsData] = useState<DrsData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('drs').select('*').then(({ data }) => {
      if (data) setDrsData(data as DrsData[]);
    });
  }, []);

  const selectedStats = selected ? mockStats[selected] : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Carte des DRS — Guinée
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map SVG */}
          <div className="flex-1 relative">
            <svg viewBox="0 0 440 340" className="w-full h-auto">
              {/* Guinea outline (simplified) */}
              <path
                d="M60,80 L120,50 L180,45 L210,60 L250,55 L300,70 L370,90 L400,120 L390,160 L380,190 L360,220 L340,240 L320,260 L300,290 L270,310 L240,300 L210,290 L190,260 L160,240 L130,230 L100,240 L70,260 L50,240 L40,200 L45,160 L50,120 L60,80Z"
                fill="hsl(174, 55%, 95%)"
                stroke="hsl(174, 55%, 38%)"
                strokeWidth="1.5"
              />

              {/* Region boundaries (simplified) */}
              <path d="M120,50 L130,140 L50,160" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />
              <path d="M130,140 L210,140 L210,60" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />
              <path d="M210,140 L130,230" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />
              <path d="M210,140 L300,140 L300,70" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />
              <path d="M210,140 L210,240 L300,290" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />
              <path d="M300,140 L300,290" stroke="hsl(170, 15%, 80%)" strokeWidth="0.5" fill="none" />

              {/* DRS Markers */}
              {(drsData.length > 0 ? drsData : Object.keys(regionPositions).map(r => ({ region: r } as DrsData))).map((drs) => {
                const pos = regionPositions[drs.region];
                if (!pos) return null;
                const stats = mockStats[drs.region];
                const hasAlerts = stats && stats.alertes > 3;
                const isSelected = selected === drs.region;

                return (
                  <g
                    key={drs.region}
                    onClick={() => setSelected(isSelected ? null : drs.region)}
                    className="cursor-pointer"
                  >
                    {/* Pulse animation for alerts */}
                    {hasAlerts && (
                      <circle cx={pos.x} cy={pos.y} r="16" fill="hsl(0, 72%, 51%)" opacity="0.15">
                        <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Marker circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 12 : 9}
                      fill={hasAlerts ? 'hsl(0, 72%, 51%)' : 'hsl(174, 55%, 38%)'}
                      stroke="white"
                      strokeWidth="2"
                      opacity={isSelected ? 1 : 0.85}
                    />
                    {/* Label */}
                    <text
                      x={pos.x}
                      y={pos.y - 16}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isSelected ? '700' : '500'}
                      fill="hsl(170, 30%, 20%)"
                      fontFamily="Inter, sans-serif"
                    >
                      {drs.region}
                    </text>
                    {/* Stock count inside circle */}
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      textAnchor="middle"
                      fontSize="6"
                      fontWeight="700"
                      fill="white"
                      fontFamily="Inter, sans-serif"
                    >
                      {stats ? Math.round(stats.stocks / 1000) + 'k' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Info panel */}
          <div className="w-full lg:w-48 space-y-3">
            {selected && selectedStats ? (
              <div className="space-y-3 animate-fade-in">
                <h4 className="font-display font-semibold text-sm">DRS {selected}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stocks</span>
                    <span className="font-semibold">{selectedStats.stocks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Commandes</span>
                    <span className="font-semibold">{selectedStats.commandes}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Alertes</span>
                    <Badge variant={selectedStats.alertes > 3 ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                      {selectedStats.alertes}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-2">Légende</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <span>DRS normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-destructive" />
                    <span>Alertes (&gt;3)</span>
                  </div>
                </div>
                <p className="mt-3 text-muted-foreground/60">Cliquez sur une DRS pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
