import { compareCodeUnits } from '../openapi/compare';
import type { CatalogOperation } from './catalog';

/** Field weights for ranking: what an operation is called counts more than its long description. */
const FIELD_WEIGHTS = { summary: 3, operation_id: 2, path: 2, tags: 2, description: 1 } as const;
const K1 = 1.2;
const B = 0.75;
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'to',
  'for',
  'in',
  'on',
  'and',
  'or',
  'by',
  'with',
  'my',
  'me',
  'i',
]);

/** Verbs that say which HTTP method the user wants. Matching operations rank higher. */
const INTENT_VERBS: Record<string, string> = {
  list: 'GET',
  get: 'GET',
  show: 'GET',
  find: 'GET',
  read: 'GET',
  fetch: 'GET',
  retrieve: 'GET',
  view: 'GET',
  look: 'GET',
  create: 'POST',
  add: 'POST',
  update: 'POST',
  edit: 'POST',
  change: 'POST',
  set: 'POST',
  modify: 'POST',
  rename: 'POST',
  delete: 'DELETE',
  remove: 'DELETE',
};
const INTENT_BOOST = 1.5;
const PARTIAL_MATCH_WEIGHT = 0.5;
const MIN_PARTIAL_LENGTH = 4;

function stem(token: string): string {
  let stemmed = token;
  if (stemmed.length > 3 && stemmed.endsWith('ies')) stemmed = `${stemmed.slice(0, -3)}y`;
  else if (stemmed.length > 3 && stemmed.endsWith('s') && !stemmed.endsWith('ss')) stemmed = stemmed.slice(0, -1);
  if (stemmed.length > 5 && stemmed.endsWith('ing')) stemmed = stemmed.slice(0, -3);
  else if (stemmed.length > 4 && stemmed.endsWith('ed')) stemmed = stemmed.slice(0, -2);
  // "shipp" from "shipped" -> "ship"
  if (stemmed.length > 3 && stemmed.at(-1) === stemmed.at(-2) && !/[aeiouls]/.test(stemmed.at(-1) ?? '')) {
    stemmed = stemmed.slice(0, -1);
  }
  return stemmed;
}

/** Lowercase word tokens, splitting camelCase and path punctuation, with light stemming. */
export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOP_WORDS.has(token))
    .map(stem);
}

/** The single HTTP method the query's verbs point to, if they agree on one. */
export function queryIntent(query: string): string | undefined {
  const methods = new Set(
    query
      .toLowerCase()
      .split(/[^a-z]+/)
      .map((word) => INTENT_VERBS[word])
      .filter(Boolean),
  );
  return methods.size === 1 ? [...methods][0] : undefined;
}

function weightedTerms(operation: CatalogOperation): Map<string, number> {
  const terms = new Map<string, number>();
  const add = (text: string, weight: number) => {
    for (const token of tokenize(text)) terms.set(token, (terms.get(token) ?? 0) + weight);
  };
  add(operation.summary, FIELD_WEIGHTS.summary);
  add(operation.operation_id, FIELD_WEIGHTS.operation_id);
  add(operation.path.replace(/\{[^}]+\}/g, ' '), FIELD_WEIGHTS.path);
  add(operation.tags.join(' '), FIELD_WEIGHTS.tags);
  add(operation.description.slice(0, 600), FIELD_WEIGHTS.description);
  return terms;
}

export interface SearchFilters {
  area?: 'admin' | 'store';
  method?: string;
  tag?: string;
}

export interface SearchIndex {
  search(query: string, filters?: SearchFilters, limit?: number): { operation: CatalogOperation; score: number }[];
}

/** BM25 over each operation's weighted summary, id, path, tags, and description. Deterministic for equal input. */
export function buildSearchIndex(operations: CatalogOperation[]): SearchIndex {
  const documents = operations.map((operation) => {
    const terms = weightedTerms(operation);
    return { operation, terms, length: [...terms.values()].reduce((sum, weight) => sum + weight, 0) };
  });
  const averageLength = documents.reduce((sum, doc) => sum + doc.length, 0) / Math.max(documents.length, 1);
  const documentFrequency = new Map<string, number>();
  for (const doc of documents) {
    for (const term of doc.terms.keys()) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
  const idf = (term: string) => {
    const frequency = documentFrequency.get(term) ?? 0;
    return Math.log(1 + (documents.length - frequency + 0.5) / (frequency + 0.5));
  };

  const vocabulary = [...documentFrequency.keys()];
  /** Index terms that share a prefix with a query term (shipment for ship, store for storefront), at half weight. */
  const partials = (term: string) =>
    term.length < MIN_PARTIAL_LENGTH
      ? []
      : vocabulary.filter(
          (candidate) =>
            candidate !== term &&
            candidate.length >= MIN_PARTIAL_LENGTH &&
            (candidate.startsWith(term) || term.startsWith(candidate)),
        );

  return {
    search(query, filters = {}, limit = 5) {
      const terms = [...new Set(tokenize(query))].map((term) => ({ term, partials: partials(term) }));
      const intent = queryIntent(query);
      const bm25 = (doc: (typeof documents)[number], term: string, weight: number) => {
        const frequency = doc.terms.get(term) ?? 0;
        if (!frequency) return 0;
        return (
          (weight * idf(term) * frequency * (K1 + 1)) / (frequency + K1 * (1 - B + (B * doc.length) / averageLength))
        );
      };
      const method = filters.method?.toUpperCase();
      const tag = filters.tag?.toLowerCase();
      return documents
        .filter(({ operation }) => !filters.area || operation.area === filters.area)
        .filter(({ operation }) => !method || operation.method === method)
        .filter(({ operation }) => !tag || operation.tags.some((candidate) => candidate.toLowerCase() === tag))
        .map((doc) => {
          const relevance = terms.reduce(
            (score, { term, partials: related }) =>
              score +
              Math.max(bm25(doc, term, 1), ...related.map((candidate) => bm25(doc, candidate, PARTIAL_MATCH_WEIGHT))),
            0,
          );
          return {
            operation: doc.operation,
            score: intent === doc.operation.method ? relevance * INTENT_BOOST : relevance,
          };
        })
        .filter((result) => result.score > 0)
        .sort(
          (left, right) =>
            right.score - left.score || compareCodeUnits(left.operation.operation_id, right.operation.operation_id),
        )
        .slice(0, limit);
    },
  };
}
