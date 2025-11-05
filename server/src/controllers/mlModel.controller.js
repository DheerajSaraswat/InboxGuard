import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function to check ML API health
const checkMLAPIHealth = async (mlApiUrl) => {
    try {
        const healthUrl = `${mlApiUrl}/health`;
        const healthResponse = await axios.get(healthUrl, {
            timeout: 5000, // 5 second timeout for health check
        });
        return healthResponse.status === 200;
    } catch (error) {
        console.error("ML API health check failed:", error.message);
        return false;
    }
};

const getReport = asyncHandler(async (req, res) => {
    const { email_text } = req.body;
    
    if (!email_text || !email_text.trim()) {
        return res.status(400).json({ 
            message: "email_text is required",
            classification: "legitimate",
            is_phishing: false,
            confidence: 0
        });
    }
    
    const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
    console.log(`ML API URL: ${mlApiUrl}`);
    
    // Check ML API health first
    const isHealthy = await checkMLAPIHealth(mlApiUrl);
    if (!isHealthy) {
        console.warn("ML API health check failed, returning safe default");
        return res.status(200).json({
            classification: "legitimate",
            is_phishing: false,
            confidence: 0,
            message: "ML model service unavailable. Please check the ML API is running."
        });
    }
    
    try {
        console.log(`Calling ML API at: ${mlApiUrl}/classify`);
        
        // Call ML model with longer timeout (25 seconds)
        const response = await axios.post(
            `${mlApiUrl}/classify`,
            { email_text: email_text.trim() },
            { 
                timeout: 25000, // 25 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("ML API Response:", response.data);
        
        // Return the ML model response directly to frontend
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error while calling ML model API:", error.message);
        console.error("Error code:", error.code);
        console.error("Error details:", error.response?.data || error.response?.status);
        
        // Determine error type
        let errorMessage = "ML model unavailable, defaulting to safe";
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            errorMessage = "ML API service is not reachable. Please check the ML_API_URL configuration.";
        } else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            errorMessage = "ML API request timed out. The service may be overloaded.";
        } else if (error.response) {
            errorMessage = `ML API returned error: ${error.response.status} - ${error.response.statusText}`;
        } else {
            errorMessage = error.message || "ML model unavailable, defaulting to safe";
        }
        
        // If ML API is not available or times out, return a safe default
        // This allows the email to be sent without blocking
        return res.status(200).json({
            classification: "legitimate",
            is_phishing: false,
            confidence: 0,
            message: errorMessage
        });
    }
});

export { getReport };