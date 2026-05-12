import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";

import { validateManuscriptFile } from "@/utils/fileValidator";

export interface PickedFile {
  uri: string;
  name: string;
  mime?: string;
  size: number;
}

/**
 * Wraps Expo Document Picker with lightweight validation.
 */
export function useDocumentPicker() {
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async (): Promise<PickedFile | null> => {
    setError(null);
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return null;
    const asset = res.assets[0];
    const mime = asset.mimeType ?? undefined;
    const validation = validateManuscriptFile(mime, asset.size ?? 0);
    if (!validation.ok) {
      setError(validation.message ?? "Invalid file");
      return null;
    }
    return {
      uri: asset.uri,
      name: asset.name,
      mime,
      size: asset.size ?? 0,
    };
  }, []);

  return { pick, error, clearError: () => setError(null) };
}
