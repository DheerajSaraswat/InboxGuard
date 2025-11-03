import api from "../utils/api"

export const showEmailLists = async (mailbox = "inbox", page = 1, limit = 20) => {
    try {
        const res = await api.get(`/emails/emailList`, { params: { mailbox, page, limit } });
        return {
            emails: res.data?.emails || [],
            page: res.data?.page || 1,
            total: res.data?.total || 0,
            totalPages: res.data?.totalPages || 1,
        };
    } catch (error) {
        console.error("Error fetching email lists:", error);
        throw new Error("Failed to fetch email lists from server.");
    }
}