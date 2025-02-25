import clsx from 'clsx';
import { CSSProperties, FC } from 'react';
import { FileUploader } from 'react-drag-drop-files';

interface FileInputProps {
  id?: string;
  name: string;
  multiple?: boolean;
  label?: string;
  className?: string;
  encType?: string;
  required?: boolean;
  disabled?: boolean;
  hoverTitle?: string;
  fileOrFiles?: File[] | File | null;
  classes?: string;
  types?: string[];
  onTypeError?: (err: any) => void;
  children?: React.ReactNode;
  maxSize?: number;
  minSize?: number;
  onSizeError?: (file: File) => void;
  onDrop?: (file: File) => void;
  onSelect?: (file: File) => void;
  handleChange?: (files: File[]) => void;
  onDraggingStateChange?: (dragging: boolean) => void;
  dropMessageStyle?: CSSProperties;
}

// Note: this component is unstyled and meant to be used with children
export const ImageUploader: FC<FileInputProps> = ({ className, ...props }) => {
  return (
    <FileUploader
      encType="multipart/form-data"
      multiple={true}
      types={['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP']}
      classes={clsx('!m-0 !border-none !p-0', className)}
      label="Upload or drop image file(s) here"
      {...props}
    />
  );
};
