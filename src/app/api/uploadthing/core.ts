import { db } from '@/db';
import sharp from 'sharp';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { z } from 'zod';

const f = createUploadthing();

const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      try {
        const res = await fetch(file.url);
        if (!res.ok) throw new Error('Failed to fetch the uploaded image');
        
        const buffer = await res.arrayBuffer();
        const image = sharp(Buffer.from(buffer));

        // Get image metadata
        const imgMetadata = await image.metadata();
        const { width, height } = imgMetadata;

        if (!width || !height) {
          throw new Error('Unable to read image dimensions');
        }

        // Validate image dimensions
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          throw new Error(`Image is too large. Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}`);
        }
        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          throw new Error(`Image is too small. Min dimensions: ${MIN_WIDTH}x${MIN_HEIGHT}`);
        }

        // Optimize image
        const optimizedImage = await image
          .resize(Math.min(width, MAX_WIDTH), Math.min(height, MAX_HEIGHT), { fit: 'inside' })
          .webp({ quality: 80 })
          .toBuffer();

        // TODO: Implement uploadToStorage function
        // const imageUrl = await uploadToStorage(optimizedImage);
        
        // For now, we'll continue using the original URL
        const imageUrl = file.url;

        if (!configId) {
          const configuration = await db.configuration.create({
            data: {
              imageUrl,
              height,
              width,
            },
          });

          console.log(`New configuration created: ${configuration.id}`);
          return { configId: configuration.id };
        } else {
          const updatedConfiguration = await db.configuration.update({
            where: { id: configId },
            data: { croppedImageUrl: imageUrl },
          });

          console.log(`Configuration updated: ${updatedConfiguration.id}`);
          return { configId: updatedConfiguration.id };
        }
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;