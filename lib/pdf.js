/**
 * CraftMyPDF Utility Module
 * Handles communication with the CraftMyPDF REST API for automated document generation.
 */

export async function generatePDF(templateId, data, options = {}) {
  const API_KEY = process.env.CRAFT_MY_PDF_API_KEY;
  
  if (!API_KEY) {
    console.error("CRAFT_MY_PDF_API_KEY is missing in environment variables.");
    throw new Error("PDF Service Configuration Error");
  }

  try {
    const response = await fetch('https://api.craftmypdf.com/v1/create', {
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: templateId,
        data: data,
        export_type: options.exportType || 'json',
        expiration: options.expiration || 60,
        region: options.region || 'us-east-1',
        ...options.additionalParams
      })
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch (e) {
        // Fallback to status text
      }
      throw new Error(`CraftMyPDF Service: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error("PDF Generation failed:", error);
    throw error;
  }
}

/**
 * Validates if a user has earned a specific document
 */
export function canUserAccessDocument(user, documentType) {
  // Logic to verify if user has completed the required steps
  // Example: if (documentType === 'CAMPAIGN_CERT') return user.completedMissions.length === totalMissions;
  return true; 
}
