// src/components/wizard/ScenarioManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  fetchAllDrafts,
  createDraft,
  activateDraft,
  deleteDraft,
  selectAllDrafts,
  selectActiveDraft,
} from '@/lib/redux/features/scheduleDraftSlice';
import useWizardData from '@/hooks/useWizardData';

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ScenarioManager() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const drafts = useAppSelector(selectAllDrafts);
  const activeDraft = useAppSelector(selectActiveDraft);
  const wizardData = useWizardData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDialogOpen) {
      dispatch(fetchAllDrafts());
    }
  }, [isDialogOpen, dispatch]);

  const handleCreate = async () => {
    if (!newScenarioName.trim()) {
      toast({ variant: 'destructive', title: 'Nom du scénario requis' });
      return;
    }
    setLoading(true);
    try {
      await dispatch(createDraft({ 
        name: newScenarioName, 
        description: newScenarioDesc,
        wizardData 
      })).unwrap();
      toast({ title: 'Nouveau scénario créé et activé' });
      setNewScenarioName('');
      setNewScenarioDesc('');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (draftId: string) => {
    setLoading(true);
    try {
      await dispatch(activateDraft(draftId)).unwrap();
      toast({ title: 'Scénario activé', description: "Les données du scénario ont été chargées." });
      setIsDialogOpen(false);
      // Let the main page handle data re-hydration from the new active draft state
      window.location.reload(); 
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (draftId: string) => {
    setDeletingId(draftId);
    try {
      await dispatch(deleteDraft(draftId)).unwrap();
      toast({ title: 'Scénario supprimé' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur de suppression', description: error.message });
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Gérer les Scénarios</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gérer les Scénarios d'Emploi du Temps</DialogTitle>
          <DialogDescription>
            Créez, chargez ou supprimez différents scénarios pour expérimenter avec votre emploi du temps.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Nouveau Scénario</h4>
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Nom</Label>
              <Input 
                id="scenario-name" 
                value={newScenarioName} 
                onChange={(e) => setNewScenarioName(e.target.value)} 
                placeholder="Ex: Plan A - Semestre 1"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-desc">Description (Optionnel)</Label>
              <Input 
                id="scenario-desc" 
                value={newScenarioDesc} 
                onChange={(e) => setNewScenarioDesc(e.target.value)}
                placeholder="Avec contraintes pour les examens..."
                disabled={loading}
              />
            </div>
            <Button onClick={handleCreate} disabled={loading || !newScenarioName.trim()} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer et Activer
            </Button>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Scénarios Existants</h4>
            <ScrollArea className="h-64 border rounded-lg p-2">
               {drafts.length > 0 ? drafts.map(draft => (
                 <div key={draft.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {draft.name}
                        {draft.isActive && <CheckCircle className="h-4 w-4 text-green-500" title="Actif" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{draft.description}</p>
                    </div>
                    <div className="flex gap-1">
                       <Button size="sm" variant="outline" onClick={() => handleLoad(draft.id)} disabled={draft.isActive || loading}>
                          Charger
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" disabled={loading || deletingId === draft.id}>
                              {deletingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement le scénario "{draft.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(draft.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </div>
                 </div>
               )) : <p className="text-sm text-center text-muted-foreground py-10">Aucun scénario sauvegardé.</p>}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
