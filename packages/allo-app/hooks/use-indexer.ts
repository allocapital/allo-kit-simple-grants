"use client";

import { useQuery } from "@tanstack/react-query";
import { OperationResult, TypedDocumentNode } from "urql";
import { Address, Hex } from "viem";
import { useChainId } from "wagmi";
import { createClient } from "~/lib/graphql";
import { useCurrentChainName } from "./use-current-chain";
import { chains } from "~/config";

export type RegistrationWhere = {
  id?: Hex;
  index?: number;
  address_in?: Address[];
  strategy_in?: Address[];
  isApproved?: boolean;
};
type AllocationWhere = {
  amount_gt?: number;
  amount_lt?: number;
  from_in?: Address[];
  from_not_in?: Address[];
  to_in?: Address[];
  to_not_in?: Address[];
  tokenAddress_in?: Address[];
  strategy_in?: Address[];
};
export type IndexerQuery = {
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  where?: RegistrationWhere | AllocationWhere;
};

export function useIndexer<T>({
  queryKey,
  queryFn,
  query,
  variables,
  enabled = true,
  ...rest
}: {
  queryKey: unknown[];
  queryFn: (r: OperationResult["data"]) => Promise<{
    items: T[];
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
    };
  }>;
  query: TypedDocumentNode;
  variables: IndexerQuery;
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const network = useCurrentChainName();
  const chainId = chains[network as keyof typeof chains]?.id;
  const client = createClient(chainId!);
  const res = useQuery({
    enabled: !!client && enabled,
    queryKey: [...queryKey, network],
    queryFn: async () => {
      return client
        ?.query(query, variables)
        .toPromise()
        .then((r) => {
          console.log(r);
          if (r.error) throw new Error(r.error.message);
          return queryFn(r.data);
        });
    },
    refetchInterval: ({ state, ...rest }) =>
      // Try refetching if items are empty. Sometimes the indexer takes time to pick up the new data.
      {
        return state.data?.items.length ? 0 : 1000;
      },
    ...rest,
  });

  return { ...res, queryKey };
}
