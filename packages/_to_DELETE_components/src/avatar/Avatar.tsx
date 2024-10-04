import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  firstName: string;
  lastName?: string;
  imageURL?: string;
}

export const Avatar: FC<AvatarProps> = ({ className, firstName, lastName, imageURL }) => {
  const firstInitial = firstName?.charAt(0);
  const lastInitial = lastName?.charAt(0);

  return (
    <div
      className={clsx(
        'text-md bg-primary-100 hover:bg-primary-200 text-primary-700 inline-flex !h-9 !w-9 items-center justify-center rounded-full font-bold uppercase',
        className
      )}
    >
      {!imageURL && (firstName || lastName) && (
        <div>
          {firstInitial}
          {lastInitial}
        </div>
      )}
      {imageURL && <img src={imageURL} className="h-full w-full rounded-md" alt={firstName} />}
    </div>
  );
};
