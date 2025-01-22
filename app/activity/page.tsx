import ActivityTrackerClient from "@/component/ActivityTrackerClient";
import { fetchActivities } from "../api/activity/fetchActivities";

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

const ActivityTracker = async ({ searchParams }: PageProps) => {
    const yearParam = searchParams.year ? parseInt(searchParams.year as string) : new Date().getFullYear();
    const activityGrid = await fetchActivities(yearParam);

    return (
        <ActivityTrackerClient
            initialActivityGrid={activityGrid}
            initialYear={yearParam}
        />
    );
};

export default ActivityTracker;
