//Fetching and organizing data from the API
import axios from "axios";

//Runtime type checks

export interface Trade {
    size: number
    price: number
    value: number
    tradeType: string,
    tradeDate: string
    assetType: string
    assetTicker: string
    issuerName: string
    issuerTicker: string
    polFirstName: string
    polLastName: string
    polChamber: string
    reportingGap: number
    // Might Need these to send additional requests to CapitolTrades
    // _txId: number
    // _politicianId: string
    // _assetId: number
    // _issuerId: number
}

//Interface needed for CapitolTrades

interface CTTradeData {
    data: CTTrade[]
    meta: CTTradeMeta
}

interface CTTradeMeta {
    paging: CTTradePaging
}

interface CTTradePaging {
    page: number
    size: number
    totalItems: number
    totalPages: number
}

interface CTTrade {
    _txId: number
    _politicianId: string
    _assetId: number
    _issuerId: number
    txDate: string
    txType: string
    chamber: string
    price: number
    size: number
    value: number
    filingURL: string
    reportingGap: number
    committees: string[]
    asset: CTAsset
    issuer: CTIssuer
    politician: CTPolitician
}

interface CTAsset {
    assetType: string
    assetTicker: string
}

interface CTIssuer {
    country: string
    issuerName: string
    issuerTicker: string
}

interface CTPolitician {
    chamber: string
    firstName: string
    gender: string
    lastName: string
    party: string
}

const pageSize = 36;
const sortByQuery = "sortBy=-txDate";
const pageQuery = "page=";
const tradesUrl = `https://bff.capitoltrades.com/trades?${sortByQuery}&pageSize=${pageSize}`;

function convertCTTradeToTrade(ctTrade: CTTrade): Trade {
    return {
        size: ctTrade.size,
        price: ctTrade.price,
        value: ctTrade.value,
        tradeType: ctTrade.txType,
        assetType: ctTrade.asset.assetType,
        assetTicker: ctTrade.asset.assetTicker,
        issuerName: ctTrade.issuer.issuerName,
        issuerTicker: ctTrade.issuer.issuerTicker,
        polFirstName: ctTrade.politician.firstName,
        polLastName: ctTrade.politician.lastName,
        polChamber: ctTrade.politician.chamber,
        reportingGap: ctTrade.reportingGap,
        tradeDate: ctTrade.txDate,
    }
}

/**
* Fetches all trades from the CapitolTrades API. No cache
* 
* Checks for the new trades by looking at the disparity between the last trade count and the current trade count
**/
export class TradeFetcher {
    lastTradeCount: number | null;
    constructor(lastTradeCount: number | null) {
        this.lastTradeCount = lastTradeCount;
    }

    /**
     * Fetches the total number of trades on the CapitolTrades API
     *
     * @returns The total number of trades on the CapitolTrades API
     */
    public async fetchTradeCount(): Promise<number | null> {
        const res = await axios.get(tradesUrl);
        try {
            //let rawTradeData = await sch.cTTradeDataSchema.parseAsync(res.data) as CTTradeData;
            const rawTradeData = res.data as CTTradeData;
            return rawTradeData.meta.paging.totalItems
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    /**
     * Fetches the last N pages of trades from the CapitolTrades API
     * 
     * The trades are sorted by date in descending order
     *
     * @param n The number of pages to fetch
     * @returns n pages of trades
     */
    private async fetchNPages(n: number): Promise<Trade[]> {
        const trades: Trade[] = [];
        for (let i = 1; i <= n; i++) {
            const res = await axios.get(tradesUrl + "&" + pageQuery + i);
            // zod doesn't work
            //let rawTradeData = await sch.cTTradeDataSchema.parseAsync(res.data) as CTTradeData;
            const rawTradeData = res.data as CTTradeData;
            const page = rawTradeData.data.map((ctTrade) => {
                return convertCTTradeToTrade(ctTrade)
            });
            trades.push(...page);
        }
        return trades;
    }

    /**
     * Fetches all new trades since the last time this function was called.
     * 
     * The trades are sorted by date in descending order
     * 
     * @returns An array of trades
     */
    public async fetchAllNewTrades(): Promise<Trade[]> {
        const tradeCount = await this.fetchTradeCount();
        if (tradeCount === null) return [];
        if (this.lastTradeCount === null) {
            this.lastTradeCount = tradeCount;
            return [];
        }
        const numNewTrades = tradeCount - this.lastTradeCount;
        if (numNewTrades <= 0) {
            return [];
        }
        const numPages = Math.ceil(numNewTrades / pageSize);
        const trades: Trade[] = await this.fetchNPages(numPages);
        this.lastTradeCount = tradeCount;
        return trades.slice(0, numNewTrades);
    }

    /**
     * Fetches the last N trades from the CapitolTrades API
     * 
     * The trades are sorted by date in descending order
     * 
     * @param n The number of trades to fetch
     * 
     * @returns Array of n trades
     */
    public async fetchLastNTrades(n: number): Promise<Trade[]> {
        const numPages = Math.ceil(n / pageSize);
        const trades: Trade[] = await this.fetchNPages(numPages);
        return trades.slice(0, n);
    }
}