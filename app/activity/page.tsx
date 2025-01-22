import ActivityTrackerClient from "@/component/ActivityTrackerClient";
import { fetchActivities } from "../api/activity/fetchActivities";

interface SearchParams {
    year?: string;
}

const ActivityTracker = async ({
    searchParams,
}: {
    searchParams: SearchParams;
}) => {
    const yearParam = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
    const activityGrid = await fetchActivities(yearParam);

    return (
        <ActivityTrackerClient
            initialActivityGrid={activityGrid}
            initialYear={yearParam}
        />
    );
};

export default ActivityTracker;