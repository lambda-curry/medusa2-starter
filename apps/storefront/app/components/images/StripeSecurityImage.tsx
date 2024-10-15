import StripeBadge from '@app/components/common/assets/StripeBadge.png';

export interface StripeSecurityImageProps {
  className?: string;
}

export const StripeSecurityImage = ({ className }: StripeSecurityImageProps) => {
  return <img className={className} width={320} src={StripeBadge} alt="stripe security badge" />;
};
