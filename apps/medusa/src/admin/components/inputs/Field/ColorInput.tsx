import { Input } from './Input';

interface ColorInputProps {
  onChange: (color: string) => void;
  selectedColor: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ onChange, selectedColor, onKeyDown, onBlur }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center p-2">
      <Input
        type="color"
        value={selectedColor}
        onChange={handleChange}
        className="w-7 h-7 p-0 border-0 mr-4 rounded-sm"
        onBlur={onBlur}
      />
      <Input
        type="text"
        placeholder="#a232a4"
        value={selectedColor}
        onChange={handleChange}
        className="flex-grow"
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
