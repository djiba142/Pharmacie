import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, ArrowLeft, Upload, MapPin, Building2, User, FileText, ClipboardCheck } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

const TYPES_STRUCTURE = [
  { value: 'PHARMACIE_PUBLIQUE', label: 'Pharmacie publique' },
  { value: 'PHARMACIE_PRIVEE', label: 'Pharmacie privée' },
  { value: 'CENTRE_SANTE', label: 'Centre de santé' },
  { value: 'POSTE_SANTE', label: 'Poste de santé' },
  { value: 'HOPITAL', label: 'Hôpital' },
  { value: 'CLINIQUE', label: 'Clinique privée' },
];

const REGIONS = ['Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', "N'Zérékoré"];

const DOCS_REQUIRED: Record<string, { label: string; required: boolean; forTypes: string[] }[]> = {
  all: [
    { label: 'Licence d\'exercice / Agrément', required: true, forTypes: [] },
    { label: 'CNIE du Responsable', required: true, forTypes: [] },
    { label: 'Casier Judiciaire (B3)', required: true, forTypes: [] },
    { label: 'Bail + Plan Cadastral', required: true, forTypes: [] },
    { label: 'Photo Façade', required: true, forTypes: [] },
  ],
  private: [
    { label: 'RCCM (< 3 mois)', required: true, forTypes: ['PHARMACIE_PRIVEE', 'CLINIQUE'] },
    { label: 'NIF', required: true, forTypes: ['PHARMACIE_PRIVEE', 'CLINIQUE'] },
  ],
  public: [
    { label: 'Arrêté de Nomination', required: true, forTypes: ['PHARMACIE_PUBLIQUE', 'CENTRE_SANTE', 'POSTE_SANTE', 'HOPITAL'] },
  ],
  pharma: [
    { label: 'Diplôme Docteur en Pharmacie', required: true, forTypes: ['PHARMACIE_PUBLIQUE', 'PHARMACIE_PRIVEE'] },
    { label: 'Ordre des Pharmaciens', required: true, forTypes: ['PHARMACIE_PRIVEE'] },
  ],
  med: [
    { label: 'Diplôme Directeur/Médecin', required: true, forTypes: ['HOPITAL', 'CLINIQUE', 'CENTRE_SANTE'] },
    { label: 'Ordre des Médecins', required: true, forTypes: ['CLINIQUE'] },
  ],
};

const STEPS = [
  { icon: Building2, label: 'Type & Localisation' },
  { icon: MapPin, label: 'Informations structure' },
  { icon: User, label: 'Responsable' },
  { icon: FileText, label: 'Documents' },
  { icon: ClipboardCheck, label: 'Validation' },
];

// Validation helpers
const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhoneGuinea = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  // Format: +224 XXX XX XX XX ou 224XXXXXXXXX ou 6XXXXXXXX ou 7XXXXXXXX
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(\+224|224)?[67]\d{8}$/;
  return regex.test(cleaned);
};

const validateFileSize = (file: File | null): boolean => {
  if (!file) return true;
  const maxSize = 5 * 1024 * 1024; // 5 MB
  return file.size <= maxSize;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function DemandeInscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [numeroSuivi, setNumeroSuivi] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    type_structure: '', region: '', prefecture: '',
    nom_structure: '', adresse: '', telephone: '', email: '',
    latitude: '', longitude: '',
    responsable_nom: '', responsable_prenom: '', responsable_telephone: '',
    responsable_email: '', responsable_num_ordre: '',
  });
  const [uploads, setUploads] = useState<Record<string, File | null>>({});

  const getRequiredDocs = () => {
    const t = form.type_structure;
    if (!t) return [];
    const docs = [...DOCS_REQUIRED.all];
    Object.values(DOCS_REQUIRED).forEach(group => {
      group.forEach(doc => {
        if (doc.forTypes.length === 0) return;
        if (doc.forTypes.includes(t)) docs.push(doc);
      });
    });
    return docs;
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!form.type_structure) newErrors.type_structure = 'Le type de structure est obligatoire';
      if (!form.region) newErrors.region = 'La région est obligatoire';
      if (!form.prefecture) newErrors.prefecture = 'La préfecture est obligatoire';
    }

    if (currentStep === 1) {
      if (!form.nom_structure) newErrors.nom_structure = 'Le nom de la structure est obligatoire';
      if (!form.adresse) newErrors.adresse = 'L\'adresse est obligatoire';

      // Validation email
      if (form.email && !validateEmail(form.email)) {
        newErrors.email = 'Format d\'email invalide (ex: nom@domaine.gn)';
      }

      // Validation téléphone
      if (form.telephone && !validatePhoneGuinea(form.telephone)) {
        newErrors.telephone = 'Format invalide. Utilisez: +224 XXX XX XX XX ou 6XXXXXXXX';
      }
    }

    if (currentStep === 2) {
      if (!form.responsable_nom) newErrors.responsable_nom = 'Le nom du responsable est obligatoire';
      if (!form.responsable_prenom) newErrors.responsable_prenom = 'Le prénom du responsable est obligatoire';

      // Validation email responsable
      if (form.responsable_email && !validateEmail(form.responsable_email)) {
        newErrors.responsable_email = 'Format d\'email invalide';
      }

      // Validation téléphone responsable
      if (form.responsable_telephone && !validatePhoneGuinea(form.responsable_telephone)) {
        newErrors.responsable_telephone = 'Format invalide. Utilisez: +224 XXX XX XX XX';
      }
    }

    if (currentStep === 3) {
      const requiredDocs = getRequiredDocs().filter(doc => doc.required);
      const missingDocs = requiredDocs.filter(doc => !uploads[doc.label]);

      if (missingDocs.length > 0) {
        newErrors.documents = `Veuillez télécharger tous les documents obligatoires (${missingDocs.length} manquant${missingDocs.length > 1 ? 's' : ''})`;
      }

      // Vérifier la taille des fichiers
      const oversizedFiles = Object.entries(uploads)
        .filter(([_, file]) => file && !validateFileSize(file))
        .map(([label, file]) => `${label} (${formatFileSize(file!.size)})`);

      if (oversizedFiles.length > 0) {
        newErrors.documents = `Fichiers trop volumineux (max 5 MB): ${oversizedFiles.join(', ')}`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setErrors({});
      setStep(step + 1);
    }
  };

  const handleFileChange = (label: string, file: File | null) => {
    if (file && !validateFileSize(file)) {
      toast({
        title: 'Fichier trop volumineux',
        description: `${file.name} (${formatFileSize(file.size)}) dépasse la limite de 5 MB`,
        variant: 'destructive'
      });
      return;
    }
    setUploads(prev => ({ ...prev, [label]: file }));
    // Clear error if file is valid
    if (file) {
      setErrors(prev => ({ ...prev, documents: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const numero = `INS-${Date.now().toString(36).toUpperCase()}`;

      // Upload documents
      const docPaths: { label: string; path: string }[] = [];
      for (const [label, file] of Object.entries(uploads)) {
        if (file) {
          const path = `${numero}/${label.replace(/[^a-zA-Z0-9]/g, '_')}_${file.name}`;
          const { error: uploadErr } = await supabase.storage.from('registration-documents').upload(path, file);
          if (!uploadErr) docPaths.push({ label, path });
        }
      }

      const { error } = await supabase.from('demandes_inscription').insert({
        numero_suivi: numero,
        type_structure: form.type_structure,
        region: form.region,
        prefecture: form.prefecture,
        nom_structure: form.nom_structure,
        adresse: form.adresse || null,
        telephone: form.telephone || null,
        email: form.email || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        responsable_nom: form.responsable_nom,
        responsable_prenom: form.responsable_prenom,
        responsable_telephone: form.responsable_telephone || null,
        responsable_email: form.responsable_email || null,
        responsable_num_ordre: form.responsable_num_ordre || null,
        documents: docPaths,
      });

      if (error) throw error;
      setNumeroSuivi(numero);
      setSubmitted(true);
      toast({ title: 'Demande soumise', description: `Numéro de suivi: ${numero}` });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Demande soumise avec succès !</h2>
              <p className="text-sm text-muted-foreground mt-2">Votre numéro de suivi :</p>
              <p className="text-lg font-mono font-bold text-primary mt-1">{numeroSuivi}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-left">
              <p className="text-sm font-semibold mb-2">Parcours de validation :</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">1</Badge>DPS — Vérification documents (7 jours)</div>
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">2</Badge>DRS — Consolidation (48 heures)</div>
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">3</Badge>PCG — Validation finale (24 heures)</div>
              </div>
            </div>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src={logoLivramed} alt="LivraMed" className="h-8 w-8 rounded-lg" />
          <span className="font-display font-bold text-foreground">Demande d'inscription</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs hidden sm:inline ml-1">{s.label}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 mx-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display">{STEPS[step].label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2"><Label>Type de structure *</Label>
                  <Select value={form.type_structure} onValueChange={v => { setForm({ ...form, type_structure: v }); setErrors(prev => ({ ...prev, type_structure: '' })); }}>
                    <SelectTrigger className={errors.type_structure ? 'border-destructive' : ''}><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
                    <SelectContent>{TYPES_STRUCTURE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.type_structure && <p className="text-sm text-destructive">{errors.type_structure}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Région *</Label>
                    <Select value={form.region} onValueChange={v => { setForm({ ...form, region: v }); setErrors(prev => ({ ...prev, region: '' })); }}>
                      <SelectTrigger className={errors.region ? 'border-destructive' : ''}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
                  </div>
                  <div className="space-y-2"><Label>Préfecture *</Label>
                    <Input value={form.prefecture} onChange={e => { setForm({ ...form, prefecture: e.target.value }); setErrors(prev => ({ ...prev, prefecture: '' })); }} className={errors.prefecture ? 'border-destructive' : ''} />
                    {errors.prefecture && <p className="text-sm text-destructive">{errors.prefecture}</p>}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2"><Label>Nom de la structure *</Label>
                  <Input value={form.nom_structure} onChange={e => { setForm({ ...form, nom_structure: e.target.value }); setErrors(prev => ({ ...prev, nom_structure: '' })); }} className={errors.nom_structure ? 'border-destructive' : ''} />
                  {errors.nom_structure && <p className="text-sm text-destructive">{errors.nom_structure}</p>}
                </div>
                <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="9.5370" /></div>
                  <div className="space-y-2"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="-13.6785" /></div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Nom *</Label>
                    <Input value={form.responsable_nom} onChange={e => { setForm({ ...form, responsable_nom: e.target.value }); setErrors(prev => ({ ...prev, responsable_nom: '' })); }} className={errors.responsable_nom ? 'border-destructive' : ''} />
                    {errors.responsable_nom && <p className="text-sm text-destructive">{errors.responsable_nom}</p>}
                  </div>
                  <div className="space-y-2"><Label>Prénom *</Label>
                    <Input value={form.responsable_prenom} onChange={e => { setForm({ ...form, responsable_prenom: e.target.value }); setErrors(prev => ({ ...prev, responsable_prenom: '' })); }} className={errors.responsable_prenom ? 'border-destructive' : ''} />
                    {errors.responsable_prenom && <p className="text-sm text-destructive">{errors.responsable_prenom}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Téléphone</Label><Input value={form.responsable_telephone} onChange={e => setForm({ ...form, responsable_telephone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.responsable_email} onChange={e => setForm({ ...form, responsable_email: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>N° Ordre professionnel</Label><Input value={form.responsable_num_ordre} onChange={e => setForm({ ...form, responsable_num_ordre: e.target.value })} /></div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Documents requis pour votre type de structure :</p>
                {errors.documents && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{errors.documents}</p>}
                {getRequiredDocs().map(doc => (
                  <div key={doc.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.label}</span>
                      {doc.required && <Badge variant="destructive" className="text-[10px]">Obligatoire</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {uploads[doc.label] && <span className="text-xs text-success">✓ {uploads[doc.label]!.name}</span>}
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { handleFileChange(doc.label, e.target.files?.[0] || null); setErrors(prev => ({ ...prev, documents: '' })); }} />
                        <Button variant="outline" size="sm" asChild><span><Upload className="h-3 w-3 mr-1" />Charger</span></Button>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Vérifiez les informations avant soumission :</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium">{TYPES_STRUCTURE.find(t => t.value === form.type_structure)?.label}</p></div>
                  <div><p className="text-muted-foreground text-xs">Région</p><p>{form.region}</p></div>
                  <div><p className="text-muted-foreground text-xs">Structure</p><p className="font-medium">{form.nom_structure}</p></div>
                  <div><p className="text-muted-foreground text-xs">Préfecture</p><p>{form.prefecture}</p></div>
                  <div><p className="text-muted-foreground text-xs">Responsable</p><p>{form.responsable_prenom} {form.responsable_nom}</p></div>
                  <div><p className="text-muted-foreground text-xs">Documents</p><p>{Object.values(uploads).filter(Boolean).length} fichier(s)</p></div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  En soumettant cette demande, vous certifiez l'exactitude des informations fournies et acceptez
                  les conditions d'utilisation de la plateforme LivraMed.
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => { setStep(Math.max(0, step - 1)); setErrors({}); }} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Suivant <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Soumission...' : 'Soumettre la demande'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
