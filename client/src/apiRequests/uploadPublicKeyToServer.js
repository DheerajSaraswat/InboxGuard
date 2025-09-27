import api from "../utils/api"

export const uploadPublicKeyToServer = async (base64Key) => {
    try {
        const payload = {
            publicKey: base64Key
        }
        await api.post("/users/public-key",payload)
        console.log("Key successfully uploaded.");
    } catch (error) {
        console.error("Error uploading public key:", error);
        throw new Error("Failed to upload public key to server.");
    }
}