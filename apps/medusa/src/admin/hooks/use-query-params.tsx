import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

type QueryParams<T extends string> = {
	[key in T]: string | undefined;
};

type SetQueryParams<T extends string> = (
	params: Partial<QueryParams<T>>,
) => void;

export function useQueryParams<T extends string>(
	keys: T[],
	prefix?: string,
): { queryObject: QueryParams<T>; setQueryObject: SetQueryParams<T> } {
	const [params, setParams] = useSearchParams();

	// Use useMemo to create the query object from URL params
	const queryObject = useMemo(() => {
		const result = {} as QueryParams<T>;

		for (const key of keys) {
			const prefixedKey = prefix ? `${prefix}_${key}` : key;
			const value = params.get(prefixedKey) || undefined;
			result[key] = value;
		}

		return result;
	}, [keys, params, prefix]);

	const setQueryObject = (newParams: Partial<QueryParams<T>>) => {
		const newSearchParams = new URLSearchParams(params);

		for (const [key, value] of Object.entries(newParams)) {
			const prefixedKey = prefix ? `${prefix}_${key}` : key;
			if (value === undefined || value === null) {
				newSearchParams.delete(prefixedKey);
			} else {
				newSearchParams.set(prefixedKey, String(value));
			}
		}

		setParams(newSearchParams);
	};

	return {
		queryObject,
		setQueryObject,
	};
}
