"use client";

import { useState, useCallback, memo, useEffect } from "react";
import ActivityChart from "./ActivityChart";

const years = [2021, 2022, 2023, 2024, 2025];
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getColor = (activityCount: number): string => {
    if (activityCount === -1) return "";
    if (activityCount === 0) return "bg-gray-800";
    if (activityCount <= 3) return "bg-rose-500";
    if (activityCount <= 6) return "bg-rose-600";
    if (activityCount <= 9) return "bg-rose-700";
    return "bg-green-900";
};

const ActivityTrackerClient = ({
    initialActivityGrid,
    initialYear,
}: {
    initialActivityGrid: number[][];
    initialYear: number;
}) => {
    const [activityGrid, setActivityGrid] = useState<number[][]>(initialActivityGrid);
    const [activityData, setActivityData] = useState<number[]>([]); // Les données pour les 31 derniers jours
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    const [tooltip, setTooltip] = useState<{ text: string | null; x: number; y: number }>({
        text: null,
        x: 0,
        y: 0,
    });

    const fetchActivitiesForYear = async (year: number) => {
        try {
            const res = await fetch(`/api/activity?year=${year}`);
            const data = await res.json();
            setActivityGrid(data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
    };

    // Fonction pour extraire les données des 31 derniers jours
    const extractLast31Days = useCallback(() => {
        const today = new Date(); // La date actuelle
        const last31DaysData: number[] = []; // Tableau des 31 derniers jours
    
        // Générer les données pour les 31 derniers jours
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today); // Clone la date actuelle
            date.setDate(today.getDate() - i); // Recule d'un jour à chaque itération
    
            // Ajouter une valeur d'activité par défaut (par exemple 0 pour les jours passés)
            // Pour tester, vous pouvez générer une valeur aléatoire entre 0 et 10
            const activityCount = Math.floor(Math.random() * 10); // Valeur aléatoire entre 0 et 9
            last31DaysData.push(activityCount); // Ajouter la valeur d'activité générée
        }
    
        // Vérification dans la console
        console.log("Derniers 31 jours d'activités : ", last31DaysData);
    
        setActivityData(last31DaysData); // Mettre à jour les données
    }, []);
    
    useEffect(() => {
        extractLast31Days(); // Appeler la fonction pour initialiser les données au montage du composant
    }, [extractLast31Days]);

    // Memoize date calculation functions
    const getDateForWeekAndDay = useCallback((weekIndex: number, dayIndex: number) => {
        const firstDayOfYear = new Date(selectedYear, 0, 1);
        const startOfWeek = firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1;
        return new Date(selectedYear, 0, startOfWeek + weekIndex * 7 + dayIndex);
    }, [selectedYear]);

    const getMonthForWeek = useCallback((weekIndex: number) => {
        const date = getDateForWeekAndDay(weekIndex, 0);
        if (date.getFullYear() === selectedYear) {
            return date.toLocaleString('fr-FR', { month: 'short' });
        }
        return null;
    }, [selectedYear, getDateForWeekAndDay]);

    const shouldShowMonth = useCallback((weekIndex: number) => {
        if (weekIndex % 4 === 0) {
            const currentMonth = getMonthForWeek(weekIndex);
            if (!currentMonth) return false;
            
            if (weekIndex > 0) {
                const prevMonth = getMonthForWeek(weekIndex - 4);
                return currentMonth !== prevMonth;
            }
            return true;
        }
        return false;
    }, [getMonthForWeek]);
    
    const hideTooltip = useCallback(() => {
        setTooltip({ text: null, x: 0, y: 0 });
    }, []);

    // Memoize tooltip handlers
    const showTooltip = useCallback((event: React.MouseEvent, weekIndex: number, dayIndex: number) => {
        const activityCount = activityGrid ? activityGrid[weekIndex][dayIndex] : 0;
    
        if (activityCount === -1) {
            hideTooltip();
            return;
        }
    
        const date = getDateForWeekAndDay(weekIndex, dayIndex);
        const tooltipText = `${date.toLocaleDateString()} - Activity : ${activityCount}`;
    
        setTooltip({
            text: tooltipText,
            x: event.clientX,
            y: event.clientY,
        });
    }, [activityGrid, getDateForWeekAndDay, hideTooltip]);

    // Memoize year change handler
    const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        setSelectedYear(year);
        fetchActivitiesForYear(year);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Activity Tracker {selectedYear}</h1>

            <div className="mb-4">
                <label htmlFor="year" className="mr-2 text-gray-900 dark:text-gray-100">Select Year :</label>
                <select
                    id="year"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto border-separate border-spacing-1 py-3">
                    <thead>
                        <tr>
                            <th className="w-32 text-center"></th>
                            {Array.from({ length: activityGrid.length }, (_, weekIndex) => (
                                <th key={weekIndex} className="w-10 text-xs">
                                    {shouldShowMonth(weekIndex) && (
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {getMonthForWeek(weekIndex)}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {daysOfWeek.map((day, dayIndex) => (
                            <tr key={dayIndex}>
                                <td className="text-xs w-32 leading-none">{day}</td>
                                {activityGrid.map((week, weekIndex) => (
                                    <td key={weekIndex} className="w-10 text-center">
                                        <div
                                            className={`w-3 h-3 rounded-sm ${getColor(week[dayIndex])}`}
                                            onMouseEnter={(e) => showTooltip(e, weekIndex, dayIndex)}
                                            onMouseLeave={hideTooltip}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tooltip.text && (
                    <div
                        className="fixed bg-rose-500 border border-white text-white text-xs rounded-md py-1 px-2 shadow-md"
                        style={{
                            left: `${tooltip.x + 10}px`,
                            top: `${tooltip.y + 10}px`,
                            pointerEvents: "none",
                            zIndex: 10,
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>

            {/* Graphique des activités */}
            <div className="max-w-[800px] w-full">
                <ActivityChart activityData={activityData} /> 
            </div>
        </div>
    );
};

export default memo(ActivityTrackerClient);