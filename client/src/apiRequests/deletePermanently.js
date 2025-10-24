import api from "../utils/api";

export const deleteEmailPermanently = async (emailId) => {
    try {
        const res = await api.delete(`/emails/${emailId}/delete`);
        return res.data;
    } catch (error) {
        console.error("Error deleting email permanently:", error);
        throw new Error("Failed to delete email permanently.");
    }
};
