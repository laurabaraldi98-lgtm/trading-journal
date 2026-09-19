export type Trade = {
    id: number;
    account_id: number;
    symbol: string;
    direction: "long" | "short";
    entry: number;
    stop: number | null;
    exit: number;
    result: number | null;
    pnl: number;
    entry_datetime: string;
    exit_datetime: string;
};