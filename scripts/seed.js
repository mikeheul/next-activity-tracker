import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'user123'; // Identifiant d'exemple pour l'utilisateur
    const startDate = new Date('2024-01-01'); // Commence le 1er janvier 2025
    const endDate = new Date('2024-12-31'); // Fin le 31 décembre 2025

    // Remplir la base de données pour chaque jour de l'année
    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        // Décidez si une activité sera ajoutée ou non pour ce jour
        const activityCount = Math.random() < 0.7 ? Math.floor(Math.random() * 10) : 0; // 70% de chance d'avoir une activité, sinon 0

        // Créer l'activité pour le jour donné
        await prisma.activity.create({
            data: {
                userId,
                date: new Date(currentDate), // Créer une copie de la date actuelle
                activityCount, // Activité (0 ou aléatoire entre 0 et 9)
            },
        });

        console.log(`Activité ajoutée pour le ${currentDate.toDateString()} avec ${activityCount} activités.`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
