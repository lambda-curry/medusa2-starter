import { HeaderContentBlock } from '@marketplace/util/medusa/types';
import { ContentBlockComponentProps } from './types';
import { getStyleFromBlockTunes } from '../helpers/get-style-from-block-tunes';

export const ContentBlockH1: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h2
    className="text-4xl normal-case md:text-6xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockH2: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h2
    className="text-3xl normal-case md:text-5xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockH3: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h3
    className="text-2xl normal-case md:text-4xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockH4: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h4
    className="text-xl normal-case md:text-3xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockH5: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h5
    className="text-lg normal-case md:text-2xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockH6: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => (
  <h6
    className="normal-case md:text-xl"
    dangerouslySetInnerHTML={{ __html: block.data.text }}
    style={getStyleFromBlockTunes(block.tunes)}
  />
);

export const ContentBlockHeader: ContentBlockComponentProps<HeaderContentBlock> = ({ block }) => {
  switch (block.data.level) {
    case 1:
      return <ContentBlockH1 block={block} />;
    case 2:
      return <ContentBlockH2 block={block} />;
    case 3:
      return <ContentBlockH3 block={block} />;
    case 4:
      return <ContentBlockH4 block={block} />;
    case 5:
      return <ContentBlockH5 block={block} />;
    case 6:
      return <ContentBlockH6 block={block} />;
  }

  return null;
};
