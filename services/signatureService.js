/**
 * SERVICE: signatureService
 * DESCRIPTION: Stores the principal signature as a base64 data URL in localStorage.
 * No Supabase Storage bucket required — works fully offline.
 */
import { localStore } from './core';

const LOCAL_KEY = 'principal_signature_url';

/**
 * Convert an image File to a base64 data URL.
 */
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

/**
 * Upload a signature file — converts to base64 and saves to localStorage.
 * @param {File} file
 * @returns {Promise<string>} - The base64 data URL
 */
export const uploadSignature = async (file) => {
    const base64 = await fileToBase64(file);
    localStore.set(LOCAL_KEY, base64);
    return base64;
};

/**
 * Delete the stored signature.
 */
export const deleteSignature = async () => {
    localStore.set(LOCAL_KEY, null);
};
