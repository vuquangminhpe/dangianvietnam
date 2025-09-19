import axios from 'axios';
import type { Media } from '../types/Medias.type';
import type { SuccessResponse } from '../types/Utils.type';
import { getAuthToken } from './user.api';

const BASE_URL = 'https://bookmovie-5n6n.onrender.com';

// Create authenticated axios instance for media requests
const createStaffRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const mediasApi = {
  uploadImages: (image: File) => {
    const token = getAuthToken();
    const formData = new FormData()
    formData.append('image', image)

    return axios.post<SuccessResponse<Media[]>>(`${BASE_URL}/medias/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
      timeout: 30000 // 30 seconds for image upload
    })
  },
  deleteS3: ({ url, link }: { url: string; link: string }) => {
    const staffRequest = createStaffRequest();
    return staffRequest.post<SuccessResponse<Media>>(
      `/medias/delete-s3`,
      { url, link },
      {
        timeout: 10000 // 10 seconds for delete operation
      }
    )
  },
  uploadVideo: (video: File) => {
    const token = getAuthToken();
    const formData = new FormData()
    formData.append('video', video)

    return axios.post<SuccessResponse<Media[]>>(`${BASE_URL}/medias/upload-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
      timeout: 120000 // 2 minutes for video upload (larger files)
    })
  },
  uploadVideoHLS: (video: File) => {
    const token = getAuthToken();
    const formData = new FormData()
    formData.append('video', video)

    return axios.post<SuccessResponse<Media[]>>(`${BASE_URL}/medias/upload-video-hls`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
      timeout: 120000 // 2 minutes for HLS video upload (larger files)
    })
  }
}
export default mediasApi
