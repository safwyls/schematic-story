import { useState, useCallback } from 'react';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Button, Group, Stack, Progress, Alert, Image, SimpleGrid, ActionIcon, Text } from '@mantine/core';
import { IconUpload, IconX, IconPhoto, IconTrash } from '@tabler/icons-react';

interface ImageUploadProps {
  schematicId?: string; // For associating images with schematics
  onUploadSuccess: (images: UploadedImage[]) => void;
  maxImages?: number;
  userId?: string;
  authToken?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: 'cover' | 'gallery' | 'avatar' | 'thumbnail';
}

interface ImageUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  imageId?: string;
  error?: string;
}

export function ImageUpload({ schematicId, onUploadSuccess, maxImages = 10, userId, authToken }: ImageUploadProps) {
  const [uploads, setUploads] = useState<ImageUploadProgress[]>([]);
  const [previewImages, setPreviewImages] = useState<UploadedImage[]>([]);

  const handleDrop = useCallback((files: FileWithPath[]) => {
    const validFiles = files.filter(file => {
      // Validate file size (max 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`);
        return false;
      }
      return IMAGE_MIME_TYPE.includes(file.type as "image/png" | "image/jpeg" | "image/webp");
    });

    if (validFiles.length + previewImages.length > maxImages) {
      console.warn(`Cannot upload more than ${maxImages} images`);
      return;
    }

    const newUploads: ImageUploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start upload for each file
    newUploads.forEach(upload => uploadImage(upload));
  }, [previewImages.length, maxImages]);

  const uploadImage = async (upload: ImageUploadProgress) => {
    try {
      // Step 1: Request upload URL
      const uploadResponse = await fetch('https://api.schematicstory.com/images/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          fileName: upload.file.name,
          fileSize: upload.file.size,
          contentType: upload.file.type,
          schematicId, // Optional association
          imageType: schematicId ? 'gallery' : 'avatar', // Determine type
          generateThumbnail: true
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, imageId, fields } = await uploadResponse.json();

      updateUploadProgress(upload, 20, 'uploading');

      // Step 2: Upload to S3 with progress tracking
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', upload.file);

      const s3Response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!s3Response.ok) {
        throw new Error('Failed to upload to S3');
      }

      updateUploadProgress(upload, 70, 'processing', imageId);

      // Step 3: Confirm upload and wait for processing
      const confirmResponse = await fetch(`https://api.schematicstory.com/images/${imageId}/confirm-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm upload');
      }

      const { imageUrl, thumbnailUrl } = await confirmResponse.json();

      updateUploadProgress(upload, 100, 'complete', imageId);

      // Add to preview images
      const newImage: UploadedImage = {
        id: imageId,
        url: imageUrl,
        filename: upload.file.name,
        size: upload.file.size,
        type: schematicId ? 'gallery' : 'avatar'
      };

      setPreviewImages(prev => [...prev, newImage]);

    } catch (error) {
      console.error('Upload failed:', error);
      updateUploadProgress(upload, 0, 'error', undefined, error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const updateUploadProgress = (
    targetUpload: ImageUploadProgress,
    progress: number,
    status: ImageUploadProgress['status'],
    imageId?: string,
    error?: string
  ) => {
    setUploads(prev => prev.map(upload => 
      upload === targetUpload 
        ? { ...upload, progress, status, imageId, error }
        : upload
    ));
  };

  const removeImage = (imageId: string) => {
    setPreviewImages(prev => prev.filter(img => img.id !== imageId));
    // TODO: Call API to delete image from S3 and DynamoDB
  };

  return (
    <Stack>
      {/* Dropzone */}
      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        maxSize={10 * 1024 * 1024} // 10MB
        multiple={true}
        disabled={uploads.some(u => u.status === 'uploading')}
      >
        <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
          <IconPhoto size={50} stroke={1.5} />
          <div>
            <Text size="xl" inline>
              Drag images here or click to select
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Up to {maxImages} images, max 10MB each (JPG, PNG, WebP)
            </Text>
          </div>
        </Group>
      </Dropzone>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Stack gap="xs">
          {uploads.map((upload, index) => (
            <div key={index}>
              <Group justify="space-between">
                <Text size="sm" truncate style={{ maxWidth: 200 }}>
                  {upload.file.name}
                </Text>
                <Text size="sm" color={upload.status === 'error' ? 'red' : 'blue'}>
                  {upload.status}
                </Text>
              </Group>
              <Progress value={upload.progress} color={upload.status === 'error' ? 'red' : 'blue'} />
              {upload.error && (
                <Alert color="red">
                  {upload.error}
                </Alert>
              )}
            </div>
          ))}
        </Stack>
      )}

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <SimpleGrid cols={3} spacing="sm">
          {previewImages.map((image) => (
            <div key={image.id} style={{ position: 'relative' }}>
              <Image
                src={image.url}
                alt={image.filename}
                height={120}
                fit="cover"
                radius="md"
              />
              <ActionIcon
                color="red"
                size="sm"
                variant="filled"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
                onClick={() => removeImage(image.id)}
              >
                <IconTrash size="0.8rem" />
              </ActionIcon>
            </div>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}