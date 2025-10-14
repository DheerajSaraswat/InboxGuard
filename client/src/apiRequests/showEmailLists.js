import api from "../utils/api"

export const showEmailLists = async (mailbox = "inbox") => {
    try {
        const res = await api.get(`/emails/emailList?mailbox=${mailbox}`);
        return res.data?.emails || [];
    } catch (error) {
        console.error("Error fetching email lists:", error);
        throw new Error("Failed to fetch email lists from server.");
    }
}