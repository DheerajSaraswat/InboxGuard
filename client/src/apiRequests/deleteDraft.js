import api from "../utils/api";

export const deleteDraft = async (draftId) => {
  try {
    const response = await api.delete(`/emails/${draftId}/delete`);
    return response.data;
  } catch (error) {
    console.error("Error deleting draft:", error);
    throw error;
  }
};

