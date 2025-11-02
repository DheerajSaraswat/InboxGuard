import api from "../utils/api";

export const toggleStarred = async (emailId) => {
    try {
        const res = await api.patch(`/emails/${emailId}/star`);
        return res.data;
    } catch (error) {
        console.error("Error toggling starred status:", error);
        throw new Error("Failed to toggle starred status.");
    }
};








