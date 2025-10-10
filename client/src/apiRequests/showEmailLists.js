import api from "../utils/api"

export const showEmailLists = async () => {
    try {
        const res = await api.get("/emails/emailList");
        return res.data?.emails || [];
    } catch (error) {
        console.error("Error fetching email lists:", error);
        throw new Error("Failed to fetch email lists from server.");
    }
}