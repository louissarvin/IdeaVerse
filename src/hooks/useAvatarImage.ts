import { useState, useEffect } from 'react';

interface UseAvatarImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and extract avatar image URL from IPFS metadata
 */
export const useAvatarImage = (metadataUrl: string | null): UseAvatarImageResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!metadataUrl) {
      setImageUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchImageUrl = async () => {
      try {
        // Convert IPFS URL to gateway URL if needed
        const gatewayUrl = metadataUrl.startsWith('ipfs://') 
          ? metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : metadataUrl;

        // Fetch metadata JSON
        const response = await fetch(gatewayUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`);
        }

        const metadata = await response.json();
        
        // Extract image URL from metadata
        if (metadata.image) {
          const imgUrl = metadata.image.startsWith('ipfs://') 
            ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
            : metadata.image;
          
          setImageUrl(imgUrl);
        } else {
          // Fallback: use metadata URL as image URL
          setImageUrl(gatewayUrl);
        }
      } catch (err) {
        console.warn('Failed to fetch avatar image from metadata:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback: try to use metadata URL directly as image
        const fallbackUrl = metadataUrl.startsWith('ipfs://') 
          ? metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : metadataUrl;
        setImageUrl(fallbackUrl);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [metadataUrl]);

  return { imageUrl, isLoading, error };
};