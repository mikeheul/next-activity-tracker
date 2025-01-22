"use client"

import { useEffect, useState } from "react";

interface ActivityGrid {
    [week: number]: number[]; // [week][day] => activityCount
}

const ActivityTracker = () => {
    const [activityGrid, setActivityGrid] = useState<ActivityGrid | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(2025);

    const years = [2021, 2022, 2023, 2024, 2025];

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchActivities = async () => {
            const res = await fetch(`/api/activity?year=${selectedYear}`);
            const data = await res.json();
            setActivityGrid(data);
        };
        fetchActivities();
    }, [selectedYear]);

    const getColor = (activityCount: number): string => {
        if (activityCount === -1) return ""; // Pas de couleur pour les jours hors année
        if (activityCount === 0) return "bg-gray-800"; // Gris clair pour les jours sans activité
        if (activityCount <= 3) return "bg-rose-600"; // Faible activité
        if (activityCount <= 6) return "bg-rose-500"; // Activité modérée
        if (activityCount <= 9) return "bg-rose-700"; // Activité forte
        return "bg-green-900"; // Activité très forte
    };

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Jours de la semaine

    const getDateForWeekAndDay = (weekIndex: number, dayIndex: number) => {
        const firstDayOfYear = new Date(selectedYear, 0, 1); 
        const startOfWeek = firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1; // Calculer le premier jour de la semaine
        const date = new Date(selectedYear, 0, startOfWeek + (weekIndex * 7) + dayIndex); // Ajouter les semaines et jours
        return date;
    };

    const [tooltip, setTooltip] = useState<{ text: string | null; x: number; y: number }>({
        text: null,
        x: 0,
        y: 0,
    });

    const showTooltip = (event: React.MouseEvent, weekIndex: number, dayIndex: number) => {
        const activityCount = activityGrid ? activityGrid[weekIndex][dayIndex] : 0;
        const date = getDateForWeekAndDay(weekIndex, dayIndex);
        const tooltipText = `${date.toLocaleDateString()} - Activity : ${activityCount}`;

        setTooltip({
            text: tooltipText,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const hideTooltip = () => {
        setTooltip({
            text: null,
            x: 0,
            y: 0,
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-normal mb-4">Activity Tracker {currentYear}</h1>

            <div className="mb-4">
                <label htmlFor="year" className="mr-2 text-gray-900 dark:text-gray-100">Select Year :</label>
                <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
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
                            {Array.from({ length: activityGrid ? activityGrid.length : 53 }, (_, i) => (
                                <th key={i} className="w-10 text-center">
                                    {/* Semaine X */}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {daysOfWeek.map((day, dayIndex) => (
                            <tr key={dayIndex}>
                                <td className="text-xs w-32 leading-none">{day}</td>
                                {activityGrid ? (
                                    activityGrid.map((week, weekIndex) => {
                                        const activityCount = week[dayIndex];

                                        return (
                                            <td key={weekIndex} className="w-10 text-center">
                                                <div
                                                    className={`w-3 h-3 rounded-tr-md rounded-bl-md ${getColor(activityCount)}`}
                                                    onMouseEnter={(e) => showTooltip(e, weekIndex, dayIndex)}
                                                    onMouseLeave={hideTooltip}
                                                />
                                            </td>
                                        );
                                    })
                                ) : (
                                    <td colSpan={53} className="text-center">
                                        {/* Loading state */}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Tooltip */}
                {tooltip.text && (
                    <div
                        className="absolute bg-rose-500 border border-white text-white text-xs rounded-md py-1 px-2 shadow-md"
                        style={{
                            left: tooltip.x + 10,
                            top: tooltip.y + 10,
                            pointerEvents: "none",
                            zIndex: 10,
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTracker;
