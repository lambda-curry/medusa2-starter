import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
import { TextField, type TextFieldProps } from '@lambdacurry/forms/remix-hook-form/text-field';
import { FC, MouseEvent, useState } from 'react';
import { useRemixFormContext } from 'remix-hook-form';
import { IconButton } from '../../../buttons/IconButton';

export interface StyledPasswordProps extends Omit<TextFieldProps, 'type'> {}

export const StyledPassword: FC<StyledPasswordProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const { setFocus } = useRemixFormContext();
  const passwordWrapperClasses =
    'relative [&_input]:!h-12 [&_input]:border-gray-200 [&_input]:text-[14px] [&_label]:text-[14px] [&_label]:font-semibold [&_label]:text-gray-600';

  const handleToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword((prev) => !prev);

    // Use setTimeout to ensure the input type has changed before focusing
    setTimeout(() => {
      if (props.name) {
        setFocus(props.name);

        // For positioning cursor at the end, use another setTimeout
        setTimeout(() => {
          const input = document.getElementsByName(props.name)[0] as HTMLInputElement;
          if (input && input.value) {
            const end = input.value.length;
            input.setSelectionRange(end, end);
          }
        }, 0);
      }
    }, 0);
  };

  return (
    <div className={passwordWrapperClasses}>
      <TextField className="password-input [&_input]:!ring-0" {...props} type={showPassword ? 'text' : 'password'} />
      <div className="absolute right-2 top-1/2 -translate-y-[7px]">
        <IconButton
          type="button"
          icon={showPassword ? EyeSlashIcon : EyeIcon}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={handleToggleClick}
        />
      </div>
    </div>
  );
};
