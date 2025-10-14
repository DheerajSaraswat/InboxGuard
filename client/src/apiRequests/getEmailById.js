import api from "../utils/api";

export const getEmailById = async (emailId) => {
    try {
        const res = await api.get(`/emails/${emailId}`);
        return res.data?.email;
    } catch (error) {
        console.error("Error fetching email:", error);
        throw new Error("Failed to fetch email from server.");
    }
};

