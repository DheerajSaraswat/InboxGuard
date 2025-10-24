import api from "../utils/api";

export const moveEmailToTrash = async (emailId) => {
    try {
        const res = await api.patch(`/emails/${emailId}/trash`);
        return res.data;
    } catch (error) {
        console.error("Error moving email to trash:", error);
        throw new Error("Failed to move email to trash.");
    }
};

export const bulkMoveToTrash = async (emailIds) => {
    try {
        const res = await api.patch("/emails/trash/bulk", { ids: emailIds });
        return res.data;
    } catch (error) {
        console.error("Error moving emails to trash:", error);
        throw new Error("Failed to move emails to trash.");
    }
};
