import StripeBadge from '@components/assets/markethaus/StripeBadge.png';

export interface StripeSecurityImageProps {
  className?: string;
}

export const StripeSecurityImage = ({
  className,
}: StripeSecurityImageProps) => {
  return (
    <img
      className={className}
      width={320}
      src={StripeBadge}
      alt="stripe security badge"
    />
  );
};
