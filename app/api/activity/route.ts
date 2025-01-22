import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    try {
        // Extraire l'année à partir des paramètres de requête
        const url = new URL(req.url);
        const yearParam = url.searchParams.get("year");
        const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear(); // Par défaut, utiliser l'année actuelle

        // Créer une grille initiale pour 53 semaines, 7 jours par semaine
        const activityGrid = Array.from({ length: 53 }, () => Array(7).fill(-1));  // On initialise toutes les cases avec -1
        
        // Calculer le jour de la semaine du 1er janvier
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1)); // Le 1er janvier à 00:00 UTC

        // S'assurer que l'heure soit 00:00:00 en UTC
        startOfYear.setUTCHours(0, 0, 0, 0);

        const startDayOfWeek = startOfYear.getDay(); // 0 = dimanche, 6 = samedi
        const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Ajuste pour lundi comme premier jour (0 = lundi)

        // Récupérer toutes les activités de l'année
        const activities = await db.activity.findMany({
            where: {
                date: {
                    gte: startOfYear,
                    lt: new Date(currentYear + 1, 0, 1),
                },
            },
            orderBy: { date: "asc" },
        });

        // Créer une map des activités pour un accès rapide
        const activityMap = new Map();
        activities.forEach((activity) => {
            const activityDate = new Date(activity.date);
            activityMap.set(activityDate.toISOString().split('T')[0], activity.activityCount);
        });

        // Remplir la grille des activités
        let dayOfYear = -adjustedStartDay; // On commence à partir du premier jour de l'année, ajusté pour le jour de la semaine
        for (let week = 0; week < 53; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startOfYear);
                date.setDate(date.getDate() + dayOfYear); // Calculer la date actuelle basée sur le jour de l'année

                // Vérifier si la date est dans l'année courante
                if (date.getFullYear() !== currentYear) {
                    activityGrid[week][day] = -1; // Jour hors année, affecter -1
                } else {
                    const isoDate = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
                    activityGrid[week][day] = activityMap.get(isoDate) ?? 0; // Affecter le nombre d'activités ou 0
                }

                dayOfYear++; // Passer au jour suivant
            }
        }

        // Retourner la grille d'activités
        return NextResponse.json(activityGrid);
    } catch (error) {
        console.error("[ACTIVITIES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
