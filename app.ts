import { Trade,TradeFetcher } from "./data";

async function main() {
    let fetcher = new TradeFetcher(null);
    let a = await fetcher.fetchLastNTrades(10);
    console.log(a)
}

main()