//Fetching and organizing data from the API
import axios from "axios"

export interface Trade {
    size: number
    price: number
    tradeType: string
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
    txTypeExtended: any
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

/**
* Fetches all trades from the CapitolTrades API. No cache
* 
* Checks for the new trades by looking at the disparity between the last trade count and the current trade count
**/
class TradeFetcher {
    lastTradeCount: number|null;
    constructor(lastTradeCount : number|null) {
        this.lastTradeCount = lastTradeCount;
    }

    async fetchTradeCount() : Promise<number> {
        
    }

    async fetchAllNewTrades() : Promise<Trade[]> {

    }

    async fetchLastNTrades() : Promise<Trade[]> {

    }
}