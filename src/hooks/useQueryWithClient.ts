/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDeskproClient, useDeskproAppClient } from "@deskpro/app-sdk";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export const useQueryWithClient = <
  TQueryFnData = unknown,
  TError = unknown,
  TData extends TQueryFnData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: string | readonly unknown[],
  queryFn: (client: IDeskproClient) => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TQueryFnData> => {
  const { client } = useDeskproAppClient();

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    key,
    () => (client && queryFn(client)) as Promise<TQueryFnData>,
    {
      ...(options ?? {}),
      enabled:
        options?.enabled === undefined ? !!client : true && options?.enabled,
    }
  );
};

export const useQueryMutationWithClient = <
  TFuncParams = unknown,
  TData = unknown
>(
  queryFn: (client: IDeskproClient, data: TFuncParams) => Promise<TData>,
  options?:
    | Omit<UseMutationOptions<TData, unknown, unknown, unknown>, "mutationFn">
    | undefined
) => {
  const { client } = useDeskproAppClient();

  return useMutation<TData, unknown, unknown, unknown>(
    (data) =>
      (!client ? null : queryFn(client, data as TFuncParams)) as ReturnType<
        typeof queryFn
      >,
    options
  );
};
