import { useMemo, useRef, useState } from 'react';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { Image } from '../images/Image';
import { ImageUploader } from './ImageUploader';
import clsx from 'clsx';
import { FieldError } from '../forms/fields/FieldError';

export interface ProductReviewImage {
  id?: string;
  url: string;
}

interface ImageUploadWithPreviewProps {
  className?: string;
  existingImages?: ProductReviewImage[];
  name?: string;
  limit?: number;
  replace?: boolean;
}

export const ImageUploadWithPreview: React.FC<ImageUploadWithPreviewProps> = ({
  existingImages,
  className,
  name = 'images',
  limit = 50,
  replace,
}) => {
  const imageUploaderComponentRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<(File | ProductReviewImage)[]>([...(existingImages || [])]);
  const [error, setError] = useState<string>('');
  const handleFileInputChange = (newFiles: File[]) => {
    if (newFiles.length + files.length > limit && !replace) return setError(`Maximum number of images is ${limit}`);

    const fileInput = imageUploaderComponentRef.current?.querySelector(`input[type="file"]`) as HTMLInputElement;
    if (!fileInput) return;

    const dataTransfer = new DataTransfer();
    const currentFiles = Array.from(files || []).filter((file) => file instanceof File);
    if (!replace) currentFiles.forEach((file) => dataTransfer.items.add(file as File));
    const newFileArray = Array.from(newFiles || []);
    newFileArray.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;

    if (replace) return setFiles(newFileArray);
    setFiles([...files, ...newFileArray]);
  };

  const handleFileDelete = (removeIndex: number) => {
    const fileInput = imageUploaderComponentRef.current?.querySelector(`input[type="file"]`) as HTMLInputElement;
    if (!fileInput) return;

    const dataTransfer = new DataTransfer();
    const filteredFiles = files.filter((file, index) => index !== removeIndex && file instanceof File);
    filteredFiles.forEach((file) => dataTransfer.items.add(file as File));

    if (filteredFiles.length) fileInput.files = dataTransfer.files;
    else fileInput.files = null;

    const newFiles = files.filter((url, index) => index !== removeIndex);
    setFiles(newFiles);
  };

  const urls = useMemo(
    () =>
      files.map((file) => {
        if (file instanceof File) return URL.createObjectURL(file);
        return file.url;
      }),
    [files],
  );

  const keepExistingImages = existingImages?.filter((image) => urls.includes(image.url));

  return (
    <div ref={imageUploaderComponentRef} className={clsx('[&_input]:!h-0 [&_input]:!opacity-0', className)}>
      {keepExistingImages && keepExistingImages.length > 0 && (
        <input
          type="hidden"
          name="existing_images"
          value={
            keepExistingImages
              ?.filter((image) => image.url)
              ?.map((image) => image.url)
              ?.filter(Boolean) as string[]
          }
        />
      )}

      <FieldError className="my-2" error={error} />

      <ImageUploader
        handleChange={handleFileInputChange}
        name={name}
        types={['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'AVIF']}
      >
        <div className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-2 py-4 hover:border-gray-500">
          <svg
            className="text-primary relative top-0.5"
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.33317 6.66667H22.6665V16H25.3332V6.66667C25.3332 5.196 24.1372 4 22.6665 4H5.33317C3.8625 4 2.6665 5.196 2.6665 6.66667V22.6667C2.6665 24.1373 3.8625 25.3333 5.33317 25.3333H15.9998V22.6667H5.33317V6.66667Z"
              fill="currentColor"
            ></path>
            <path
              d="M10.6665 14.6667L6.6665 20H21.3332L15.9998 12L11.9998 17.3333L10.6665 14.6667Z"
              fill="currentColor"
            ></path>
            <path
              d="M25.3332 18.6667H22.6665V22.6667H18.6665V25.3333H22.6665V29.3333H25.3332V25.3333H29.3332V22.6667H25.3332V18.6667Z"
              fill="currentColor"
            ></path>
          </svg>
          <div>
            <span className="text-sm font-medium text-gray-900 underline">{`Upload image${limit > 1 ? 's' : ''}`}</span>{' '}
            <span className="text-sm text-gray-500">or drag and drop</span>
          </div>
        </div>
      </ImageUploader>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <div
            key={url}
            className="group relative my-2 h-24 w-24 flex-shrink-0 cursor-pointer justify-center overflow-hidden rounded-md border border-gray-100 bg-white text-sm font-bold uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-1"
            onClick={() => handleFileDelete(index)}
          >
            <Image
              src={url}
              alt={'preview-thumbnail'}
              className="h-full w-full object-contain object-center transition group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition group-hover:bg-opacity-50">
              <TrashIcon className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
