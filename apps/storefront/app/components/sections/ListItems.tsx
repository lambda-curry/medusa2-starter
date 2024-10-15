import { Container } from '@app/components/common/container';
import { Image, ImageProps } from '@app/components/common/images/Image';
import clsx from 'clsx';

interface ListItemsSectionProps {
  className?: string;
  title?: string;
  itemsClassName?: string;
  useFillTitle?: boolean;
  items: {
    title?: string;
    description?: string;
    image?: ImageProps;
    className?: string;
    useFillTitle?: boolean;
  }[];
}

const Item = ({ title, description, image, className, useFillTitle }: ListItemsSectionProps['items'][number]) => {
  return (
    <div className={clsx('flex flex-col gap-5 text-sm font-sen', className)}>
      {image && <Image {...image} />}
      {title && (
        <div className="flex gap-2 items-center">
          <h4 className="font-bold">{title}</h4>
          {useFillTitle && <div className="flex-1 border-t border-black" />}
        </div>
      )}
      {description && <p>{description}</p>}
    </div>
  );
};

export const ListItems = ({ title, items = [], className, itemsClassName, useFillTitle }: ListItemsSectionProps) => {
  return (
    <Container className={clsx('p-14 pt-0 lg:px-16', className)}>
      {title && (
        <>
          <h3 className="text-xl font-italiana">{title}</h3>
          <div className="w-full mt-1 mb-8 border-t border-primary" />
        </>
      )}

      <div className="flex flex-col md:flex-row gap-6 lg:gap-16">
        {items?.map((item) => (
          <Item key={item.title} className={itemsClassName} useFillTitle={useFillTitle} {...item} />
        ))}
      </div>
    </Container>
  );
};
