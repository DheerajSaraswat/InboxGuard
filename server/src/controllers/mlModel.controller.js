import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";

const getReport = asyncHandler(async (req, res)=>{
    const {email_text} = req.body;
    try {
        const response = await axios.post(process.env.ML_API_URL+"/classify",{
            email_text,
        });
        return response;
    } catch (error) {
        console.log("Error while calling model api", error);
    }
})

export {getReport};