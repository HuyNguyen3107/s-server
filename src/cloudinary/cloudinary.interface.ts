export interface CloudinaryResponse {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: CloudinaryResponse | CloudinaryResponse[];
}
