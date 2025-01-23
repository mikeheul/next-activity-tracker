"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ActivityChart = ({ activityData }: { activityData: number[] }) => {
    // Générer les 31 derniers jours pour les labels
    const labels = Array.from({ length: 31 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i)); // Calculer les dates des 31 derniers jours
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    });

    // Configuration des données pour le graphique
    const data = {
        labels,
        datasets: [
            {
                label: "Activity Count",
                data: activityData, // Les données d'activité
                borderColor: "rgb(255, 99, 132)", // Couleur de la ligne
                backgroundColor: "rgba(255, 99, 132, 0.5)", // Couleur de remplissage sous la ligne
            },
        ],
    };

    // Options pour le graphique
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Activity Tracker - Last 31 Days",
            },
        },
    };

    return <Line options={options} data={data} />;
};

export default ActivityChart;
