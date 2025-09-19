
export type MediaType = 'Image' | 'Video' | 'HLS';

export const MediaType = {
  Image: 'Image' as MediaType,
  Video: 'Video' as MediaType,
  HLS: 'HLS' as MediaType
} as const;
