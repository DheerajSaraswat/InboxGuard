import api from "../utils/api";

export const saveDraft = async (draftData) => {
    try {
        const res = await api.post("/emails/draft", draftData);
        return res.data;
    } catch (error) {
        console.error("Error saving draft:", error);
        throw new Error("Failed to save draft.");
    }
};










