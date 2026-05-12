export type AudiobookStatus = "PROCESSING" | "READY" | "FAILED";

export interface ChapterDto {
  id: string;
  index: number;
  title: string;
  audioUrl: string;
  duration: number;
  waveformData: number[];
}

export interface AudiobookDto {
  id: string;
  title: string;
  voiceId: string;
  status: AudiobookStatus;
  duration: number | null;
  chapters: ChapterDto[];
  createdAt: string;
}

export interface GenerationStatusDto {
  status: AudiobookStatus;
  progress: number;
  currentStep: string;
  chaptersReady: number;
  totalChapters: number;
  voiceId?: string;
}
