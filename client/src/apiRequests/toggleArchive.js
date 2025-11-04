import api from "../utils/api";

export const toggleArchive = async (emailId) => {
    try {
        const res = await api.patch(`/emails/${emailId}/archive`);
        return res.data;
    } catch (error) {
        console.error("Error toggling archive status:", error);
        throw new Error("Failed to toggle archive status.");
    }
};










