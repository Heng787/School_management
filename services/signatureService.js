import { localStore } from './core';

/**
 * Service for managing principal signatures.
 * Stores signatures as base64 data URLs in localStorage.
 */

const LOCAL_KEY = 'principal_signature_url';

// --- Internal Helpers ---

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- Public API ---

/**
 * Uploads a signature file — converts to base64 and saves to localStorage.
 */
export const uploadSignature = async (file) => {
  const base64 = await fileToBase64(file);
  localStore.set(LOCAL_KEY, base64);
  return base64;
};

/**
 * Deletes the stored signature.
 */
export const deleteSignature = async () => {
  localStore.set(LOCAL_KEY, null);
};
