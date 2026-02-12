"use client";

import { useState, useEffect, useMemo } from "react";
import type { VoiceOption } from "@/types";

/**
 * Voice selector — two-tier selection (locale → voice) for Edge TTS voices.
 * Fetches available voices from GET /api/voices on mount.
 */

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({
  selectedVoiceId,
  onVoiceChange,
  disabled = false,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocale, setSelectedLocale] = useState("");

  // Fetch voices on mount
  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch("/api/voices");
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices);

          // Set initial locale from the selected voice
          const currentVoice = data.voices.find(
            (v: VoiceOption) => v.id === selectedVoiceId
          );
          setSelectedLocale(currentVoice?.locale || "en-US");
        }
      } catch {
        // Silently fail — voice selector will be empty
      } finally {
        setIsLoading(false);
      }
    }
    fetchVoices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unique locales sorted alphabetically
  const locales = useMemo(() => {
    const uniqueLocales = [...new Set(voices.map((v) => v.locale))].sort();
    return uniqueLocales;
  }, [voices]);

  // Voices filtered by selected locale
  const filteredVoices = useMemo(() => {
    return voices.filter((v) => v.locale === selectedLocale);
  }, [voices, selectedLocale]);

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
    // Auto-select first voice in the new locale
    const firstVoice = voices.find((v) => v.locale === locale);
    if (firstVoice) {
      onVoiceChange(firstVoice.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Locale selector */}
      <select
        value={selectedLocale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        disabled={disabled}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale}
          </option>
        ))}
      </select>

      {/* Voice selector */}
      <select
        value={selectedVoiceId}
        onChange={(e) => onVoiceChange(e.target.value)}
        disabled={disabled}
        className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {filteredVoices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} ({voice.gender})
          </option>
        ))}
      </select>
    </div>
  );
}
