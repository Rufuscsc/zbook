import cloudinary from "./cloudinary";

export const UploadImage = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  console.log(`[UploadImage] Starting upload for ${file.name || "file"} (${bytes.length} bytes) to folder ${folder}`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: folder,
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          console.error(`[UploadImage] Error uploading ${file.name || "file"}:`, error);
          return reject(error);
        }
        console.log(`[UploadImage] Successfully uploaded ${file.name || "file"}`);
        return resolve(result);
      }
    )
    .end(bytes);
  });
};
