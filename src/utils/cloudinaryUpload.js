const CLOUDINARY_CLOUD = 'dimaxhbqc';
const CLOUDINARY_PRESET = 'j3oqskcx';

export const uploadToCloudinary = async (uri, filename = 'upload.jpg') => {
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: filename });
  formData.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  );
  const json = await res.json();
  if (!json.secure_url) throw new Error(json.error?.message || 'Upload gagal');
  return json.secure_url;
};
