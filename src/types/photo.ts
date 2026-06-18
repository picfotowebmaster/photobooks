export interface Photo {
  id: string;
  user_id: string;
  project_id: string | null;
  bucket_path_highres: string;
  bucket_path_lowres: string;
  original_width: number;
  original_height: number;
  file_size: number | null;
  uploaded_at: string;
}

export interface PhotoUploadResult {
  photoId: string;
  highResUrl: string;
  lowResUrl: string;
  lowResBlob: Blob;
  width: number;
  height: number;
}
