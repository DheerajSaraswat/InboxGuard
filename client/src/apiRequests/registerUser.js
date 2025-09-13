import api from "../utils/api"

export const registerUser = async(user)=>{
    try {
        const res = await api.post("/users/register",{
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        });
        return res;
    } catch (error) {
        console.log("Error while registering user: ",error);
        throw error;
    }
}