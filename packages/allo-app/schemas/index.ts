import { Address, Hex } from "viem";

export type Registration = {
  id: string;
  index: number;
  address: Address;
  metadata: {
    title: string;
    image: string;
    description: string;
  };
  allocations?: { items: Allocation[] };
  strategy: { address: Address; name: string };
  isApproved: boolean;
};

export type Allocation = {
  id: string;
  amount: number;
  from: Address;
  to: Address;
  token: { symbol: string; address: Address; decimals: number };
  registration: { address: Address };
  createdAt: number;
};
export type Strategy = {
  name: string;
  createdAt: number;
};
