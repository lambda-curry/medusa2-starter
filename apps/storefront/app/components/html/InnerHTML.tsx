import React, { FC, useEffect, useRef, useState } from 'react';
import { isBrowser } from '@utils/browser';
import NoHydrationPortal from './NoHydrationPortal';
import { useHydrated } from 'remix-utils/use-hydrated';

export interface InnerHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
  permitRerenders?: boolean;
  header?: boolean;
}

export const ServerInnerHtml: React.FC<InnerHtmlProps> = ({ html, permitRerenders, ...rest }) => (
  <div {...rest} dangerouslySetInnerHTML={{ __html: html }} />
);

export const BrowserInnerHtml: React.FC<InnerHtmlProps> = ({
  html,
  permitRerenders,
  dangerouslySetInnerHTML,
  ...rest
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!html || !divRef.current) {
      console.warn('The html prop should not be null or undefined.');
      return;
    }

    if (!isFirstRender.current && !permitRerenders) return;

    isFirstRender.current = false;

    const slotHtml = document.createRange().createContextualFragment(html);
    divRef.current.innerHTML = '';
    divRef.current.appendChild(slotHtml);
  }, [html, divRef]);

  if (!html) {
    return null;
  }

  return <div {...rest} ref={divRef} />;
};

export const RenderScripts: FC<{ html: string } & InnerHtmlProps> = ({ html, ...rest }) => {
  return <BrowserInnerHtml permitRerenders html={html} {...rest} />;
};

export const InnerHtml: React.FC<InnerHtmlProps> = ({ html: htmlString, header, ...rest }) => {
  const isHydrated = useHydrated();
  if (!htmlString || !isHydrated) return null;

  const InnerHtmlComponent = isBrowser() ? BrowserInnerHtml : ServerInnerHtml;

  if (header) {
    return (
      <NoHydrationPortal>
        <InnerHtmlComponent html={htmlString} {...rest} />
      </NoHydrationPortal>
    );
  }

  return (
    <div>
      <InnerHtmlComponent html={htmlString} {...rest} />
    </div>
  );
};
