export type PayoutReceipt = {
  id: string;
  walletLabel: string;
  xHandle: string | null;
  amount: number;
  token: "POW";
  txSignature: string;
  solscanUrl: string;
  paidAt: string;
};

export type TopEarner = {
  walletLabel: string;
  xHandle: string | null;
  amount: number;
  token: "POW";
};

export type PayoutFeedData = {
  receipts: PayoutReceipt[];
  topEarner: TopEarner | null;
};

