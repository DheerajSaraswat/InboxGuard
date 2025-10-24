import api from "../utils/api";

export const getEmailById = async (emailId) => {
    try {
        const res = await api.get(`/emails/${emailId}`);
        const email = res.data?.email;
        // mark as read in background
        api.patch(`/emails/${emailId}/read`).catch(()=>{});
        return email;
    } catch (error) {
        console.error("Error fetching email:", error);
        throw new Error("Failed to fetch email from server.");
    }
};





