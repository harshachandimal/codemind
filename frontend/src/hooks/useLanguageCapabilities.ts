import { useState, useEffect } from 'react';
import { getLanguageCapabilities } from '../api/languageCapabilitiesApi';
import { LanguageCapability } from '../types/languageCapabilities';

export const useLanguageCapabilities = () => {
  const [capabilities, setCapabilities] = useState<LanguageCapability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCapabilities = async () => {
      try {
        setLoading(true);
        const data = await getLanguageCapabilities();
        if (mounted) {
          setCapabilities(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to fetch capabilities');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCapabilities();

    return () => {
      mounted = false;
    };
  }, []);

  return { capabilities, loading, error };
};
