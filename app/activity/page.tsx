import ActivityTrackerClient from "@/component/ActivityTrackerClient";
import { fetchActivities } from "../api/activity/fetchActivities";

const ActivityTracker = async ({ searchParams }: { searchParams: { year?: string } }) => {
    const params = await searchParams;
    const yearParam = params.year ? parseInt(params.year) : new Date().getFullYear();
    const activityGrid = await fetchActivities(yearParam);

    return (
        <ActivityTrackerClient
            initialActivityGrid={activityGrid}
            initialYear={yearParam}
        />
    );
};

export default ActivityTracker;
