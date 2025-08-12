// src/app/(dashboard)/shuddle/page.tsx
import prisma from '@/lib/prisma';
import ShuddlePageClient from '@/components/wizard/ShuddlePageClient';
import type { WizardData } from '@/types';
import { fetchAllDataForWizard } from '@/lib/data-fetching/fetch-wizard-data';

export default async function ShuddlePage() {
    console.log("🗓️ [ShuddlePage] Début du rendu côté serveur. Récupération des données initiales du planificateur.");
    const initialData = await fetchAllDataForWizard();
    console.log("🗓️ [ShuddlePage] Données initiales récupérées. Rendu du composant client.");

    // Serialize data to convert Date objects to strings, preventing Redux non-serializable errors.
    const serializableData = JSON.parse(JSON.stringify(initialData));

    return <ShuddlePageClient initialData={serializableData} />;
}
