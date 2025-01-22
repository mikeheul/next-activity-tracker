type ActivityGridResponse = number[][];

export const fetchActivities = async (year: number): Promise<ActivityGridResponse> => {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("API base URL is not defined");
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/activity?year=${year}`,
            {
                next: { revalidate: 60 },
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        // Validation basique du format de la réponse
        if (!Array.isArray(data) || !data.every(row => Array.isArray(row))) {
            throw new Error("Invalid response format");
        }

        return data;
    } catch (error) {
        console.error("Error fetching activities:", error);
        throw error instanceof Error 
            ? error 
            : new Error("An unexpected error occurred while fetching activities");
    }
};