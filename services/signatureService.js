/**
 * SERVICE: signatureService
 * DESCRIPTION: Handles uploading the principal signature image to Supabase Storage
 * and retrieving its public URL. Requires a public 'signatures' bucket in Supabase Storage.
 */
import { getSupabase } from './core';

const BUCKET = 'signatures';
const FILE_PATH = 'principal_signature.png';

/**
 * Upload a File/Blob to the 'signatures' bucket and return the public URL.
 * @param {File} file - The PNG file selected by the user.
 * @returns {Promise<string>} - The public URL of the uploaded image.
 */
export const uploadSignature = async (file) => {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not configured.');

    // Upload (upsert=true overwrites existing file)
    const { error: uploadError } = await client.storage
        .from(BUCKET)
        .upload(FILE_PATH, file, {
            contentType: 'image/png',
            upsert: true,
        });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = client.storage.from(BUCKET).getPublicUrl(FILE_PATH);
    if (!data?.publicUrl) throw new Error('Could not retrieve public URL for signature.');

    // Append a cache-buster so browsers always load the new image
    return `${data.publicUrl}?t=${Date.now()}`;
};

/**
 * Delete the signature from storage (optional cleanup).
 */
export const deleteSignature = async () => {
    const client = getSupabase();
    if (!client) return;
    await client.storage.from(BUCKET).remove([FILE_PATH]);
};
