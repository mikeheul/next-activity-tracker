export const fetchActivities = async (year: number): Promise<number[][]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/activity?year=${year}`, {
        next: { revalidate: 60 }, // Optionnel : revalider toutes les 60 secondes
    });
    if (!res.ok) throw new Error("Failed to fetch activities");
    return res.json();
};