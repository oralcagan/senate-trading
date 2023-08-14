import { TradeFetcher } from "./data";

async function main() {
    const fetcher = new TradeFetcher(null);
    const a = await fetcher.fetchLastNTrades(10);
    console.log(a)
}

main()