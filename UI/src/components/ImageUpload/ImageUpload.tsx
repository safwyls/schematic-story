import { useState, useCallback, useEffect } from 'react';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Group, Stack, Progress, Alert, Image, SimpleGrid, ActionIcon, Text, Paper, Loader } from '@mantine/core';
import { IconAlertCircle, IconPhoto, IconTrash } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

interface ImageUploadProps {
  schematicId?: string; // For associating images with schematics (only set after schematic is created)  
  onUploadStarted: () => void;
  onUploadProgress: (progress: number) => void;
  onUploadSuccess: (images: UploadedImage[]) => void;
  maxImages?: number;
  imageType?: 'cover' | 'gallery' | 'avatar' | 'thumbnail';
  stagingMode?: boolean; // New prop for staging uploads
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: 'cover' | 'gallery' | 'avatar' | 'thumbnail' | 'staged';
  staged?: boolean;
}

interface ImageUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  imageId?: string;
  error?: string;
}

export function ImageUpload({ schematicId, onUploadStarted, onUploadProgress, onUploadSuccess, maxImages = 10, imageType = 'gallery', stagingMode = false }: ImageUploadProps) {
  const { idToken } = useAuth();
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<ImageUploadProgress[]>([]);
  const [previewImages, setPreviewImages] = useState<UploadedImage[]>([]);

  // Mutation for requesting upload URL
  const requestUploadUrlMutation = useMutation({
    mutationFn: async (requestBody: any) => {
      const endpoint = stagingMode ? '/images/staged/upload-url' : '/images/upload-url';
      const response = await apiClient.post(endpoint, requestBody);      
      return response;
    }
  });

  // Mutation for confirming upload
  const confirmUploadMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const confirmEndpoint = stagingMode 
        ? `/images/staged/${imageId}/confirm-upload`
        : `/images/${imageId}/confirm-upload`;
      

      const response = await apiClient.post(confirmEndpoint);
      
      return response;
    }
  });

  // Mutation for deleting images
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const deleteEndpoint = stagingMode 
        ? `/images/staged/${imageId}`
        : `/images/${imageId}`;
      
      const response = await apiClient.delete(deleteEndpoint);
      
      return response;
    },
    onSuccess: (_, imageId) => {
      // Remove from preview images on successful delete
      setPreviewImages(prev => {
        const filtered = prev.filter(img => img.id !== imageId);
        onUploadSuccess(filtered); // Update parent
        return filtered;
      });
      setUploads(prev => prev.filter(upload => upload.imageId !== imageId));
      
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['images'] });
    }
  });

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
      if (!idToken) {
        throw new Error('No authentication token available');
      }
      
      const requestBody = {
        fileName: upload.file.name,
        fileSize: upload.file.size,
        contentType: upload.file.type,
        schematicId: stagingMode ? undefined : schematicId,
        imageType: stagingMode ? 'staged' : imageType,
        generateThumbnail: true,
        staged: stagingMode
      };
      
      onUploadStarted();

      // Step 1: Request upload URL using mutation
      const { uploadUrl, imageId, fields } = await requestUploadUrlMutation.mutateAsync(requestBody);
      
      updateUploadProgress(upload, 20, 'uploading');

      // Step 2: Upload to S3 with progress tracking (use fetch)
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
        const s3ErrorText = await s3Response.text();
        throw new Error(`Failed to upload to S3: ${s3Response.status} - ${s3ErrorText}`);
      }

      updateUploadProgress(upload, 70, 'processing', imageId);

      // Step 3: Confirm upload using mutation
      const { imageUrl, thumbnailUrl } = await confirmUploadMutation.mutateAsync(imageId);

      updateUploadProgress(upload, 100, 'complete', imageId);

      // Add to preview images
      const newImage: UploadedImage = {
        id: imageId,
        url: imageUrl,
        filename: upload.file.name,
        size: upload.file.size,
        type: stagingMode ? 'staged' : imageType,
        staged: stagingMode
      };

      setPreviewImages(prev => [...prev, newImage]);

      // Remove from uploads list
      setUploads(prev => prev.filter(upload => upload.file.name !== upload.file.name));

      // Notify parent component
      onUploadSuccess([...previewImages, newImage]);

      // Invalidate related queries after successful upload
      queryClient.invalidateQueries({ queryKey: ['images'] });

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
    setUploads(prev => {
      const updated = prev.map(upload => {
        const isMatch = upload.file.name === targetUpload.file.name && upload.file.size === targetUpload.file.size;
        return isMatch
          ? { ...upload, progress, status, imageId, error }
          : upload;
      });
      return updated;
    });
    onUploadProgress(progress);
  };

  const ImagePreviewItem = ({ image }: { image: UploadedImage }) => {    
    const removeImage = async (imageId: string) => {
      if (!idToken) {
        console.error('No authentication token available for delete');
        return;
      }

      try {
        await deleteImageMutation.mutateAsync(imageId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    };

    return (
      <div style={{ position: 'relative' }}>
        <Image
          src={image.url}
          alt={image.filename}
          height={120}
          fit="cover"
          radius="md"
        />
        {deleteImageMutation.isPending && deleteImageMutation.variables === image.id && <Loader
          size="sm"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
          }} 
        />
        }
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
    );
  }

  return (
    <Paper shadow="none" radius="sm">
      <Stack>
        {stagingMode && (
          <Alert icon={<IconAlertCircle />} color="blue" variant="light">
            Images are temporarily uploaded. They will be permanently saved when you submit the form.
          </Alert>
        )}

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
              <ImagePreviewItem key={image.id} image={image} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Paper>
  );
}