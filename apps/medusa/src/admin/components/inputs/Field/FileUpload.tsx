import { clx } from '@medusajs/ui';
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FC, KeyboardEvent, ReactElement } from 'react';

const defaultText = (
  <span>
    Drop your files here, or <span className="text-violet-60">click to browse</span>
  </span>
);

type FileUploadProps = {
  filetypes: string[];
  onFileChosen: (files: File[]) => void;
  className?: string;
  errorMessage?: string;
  multiple?: boolean;
  placeholder?: ReactElement | string;
  text?: ReactElement | string;
};

const FileUpload: FC<FileUploadProps> = ({
  className,
  errorMessage,
  filetypes,
  multiple = false,
  onFileChosen,
  placeholder = '',
  text = defaultText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (fileList) {
      onFileChosen(Array.from(fileList));
    }
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    setUploadError(false);
    e.preventDefault();

    const files: File[] = [];

    if (e.dataTransfer.items) {
      // use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.items.length; i += 1) {
        // if dropped items are not files, reject them
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();

          if (file && filetypes.indexOf(file.type) > -1) {
            files.push(file);
          }
        }
      }
    } else {
      // use DataTransfer interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
        if (filetypes.indexOf(e.dataTransfer.files[i].type) > -1) {
          files.push(e.dataTransfer.files[i]);
        }
      }
    }

    if (files.length === 1) {
      onFileChosen(files);
    } else {
      setUploadError(true);
    }
  };

  const handleTriggerClick = () => {
    inputRef.current?.click();
  };

  // Actions triggered using mouse events should have corresponding keyboard events
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleTriggerClick();
    }
  };

  return (
    <div
      className={clx(
        'p-4 border-2 border-dashed border-grey-20 cursor-pointer flex flex-col h-full inter-base-regular items-center justify-center rounded-rounded select-none text-grey-50 transition-colors w-full hover:border-violet-60 hover:text-grey-40',
        className,
      )}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      <div className="flex flex-col items-center">
        <p>{text}</p>
        <span>{placeholder}</span>
      </div>
      {!uploadError ? null : <span className="text-rose-60">{errorMessage || 'Please upload an image file'}</span>}
      <input
        ref={inputRef}
        accept={filetypes.join(', ')}
        className="hidden"
        multiple={multiple}
        type="file"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default FileUpload;
