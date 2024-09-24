import type { MetaArgs, MetaDescriptor, MetaFunction } from '@remix-run/node';
import { UIMatch } from '@remix-run/react';
import { MetaMatch } from '@remix-run/react/dist/routeModules';
import truncate from 'lodash/truncate';
import type { RootLoader } from './server/root.server';

const applyMetaTemplates = ({ matches }: MetaArgs<unknown, {}>, mergedMeta: MetaDescriptor[]) => {
  const rootMatch = matches[0] as UIMatch<RootLoader>;
  const siteDetails = rootMatch.data?.siteDetails;

  return mergedMeta.map(meta => {
    if ('title' in meta) {
      if (meta.title === siteDetails?.store.name) {
        return {
          title: `${meta.title}`
        };
      }
      return {
        title: `${meta.title} | ${siteDetails?.store.name}`
      };
    }

    if ('name' in meta && meta.name === 'description') {
      return {
        name: 'description',
        content: truncate(`${meta.content}`, { length: 200, separator: ' ' })
      };
    }

    if ('property' in meta && meta.property === 'og:title') {
      return {
        property: 'og:title',
        content: `${meta.content} | ${siteDetails?.store.name}`
      };
    }

    if ('property' in meta && meta.property === 'og:description') {
      return {
        property: 'og:description',
        content: truncate(`${meta.content}`, { length: 200, separator: ' ' })
      };
    }

    return meta;
  });
};

const filterEmptyMeta = (meta: MetaDescriptor[]) =>
  meta.filter(
    meta =>
      ('title' in meta && !!meta.title) || ('name' in meta && !!meta.content) || ('property' in meta && !!meta.content)
  );

const mergeMetaArrays = (prevMeta: MetaDescriptor[], nextMeta: MetaDescriptor[]) => {
  const mergedMeta = [...prevMeta];
  // Filter out empty meta before merging
  const filteredNextMeta = filterEmptyMeta(nextMeta);

  for (let override of filteredNextMeta) {
    // Find the matching index
    const index = mergedMeta.findIndex(
      meta =>
        ('title' in meta && 'title' in override) ||
        ('name' in meta && 'name' in override && meta.name === override.name) ||
        ('property' in meta && 'property' in override && meta.property === override.property)
    );

    if (index !== -1) {
      // The there is a match, remove it
      mergedMeta.splice(index, 1);
    }

    // Append the override
    mergedMeta.push(override);
  }

  return mergedMeta;
};

/**
 * A helper function to merge meta from parent routes with the current route.
 *
 * @see https://gist.github.com/ryanflorence/ec1849c6d690cfbffcb408ecd633e069
 */
export const mergeMeta =
  (...overrideFuncs: MetaFunction[]): MetaFunction =>
  arg =>
    applyMetaTemplates(
      arg,
      overrideFuncs.reduce(
        (acc: MetaDescriptor[], override: MetaFunction) => mergeMetaArrays(acc, override(arg)),
        [] as MetaDescriptor[]
      )
    );

/**
 * Gets the merged meta from the parent routes.
 */
export const getParentMeta: MetaFunction = ({ matches }) =>
  matches.reduce((acc, match: MetaMatch) => mergeMetaArrays(acc, match.meta || []), [] as MetaDescriptor[]);

/**
 * Gets the common meta most routes will use.
 */
export const getCommonMeta: MetaFunction = ({ matches }) => {
  const rootMatch = matches[0] as UIMatch<RootLoader>;
  const currentMatch: MetaMatch = matches[matches.length - 1];
  const siteDetails = rootMatch.data?.siteDetails;

  if (!siteDetails) return [];

  const canonicalUrl = `${siteDetails.site_settings.storefront_url}${currentMatch.pathname}`;

  return [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, height=device-height, user-scalable=0' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteDetails.store.name }
  ];
};
