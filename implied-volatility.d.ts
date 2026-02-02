declare module 'implied-volatility' {
    interface ImpliedVolatility {
        getImpliedVolatility(
            optionPrice: number,
            spotPrice: number,
            strikePrice: number,
            timeToExpiry: number, // in years
            riskFreeRate: number,
            type: 'call' | 'put' | string
        ): number;
    }

    const iv: ImpliedVolatility;
    export default iv;
}
