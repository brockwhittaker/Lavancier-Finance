class CurrentStats {
  constructor (ticker) {
    this.tickers = [ticker].concat(["^DJI", "^GSPC", "^IXIC", "AAPL", "GOOGL", "MSFT", "WMT", "TGT", "AA", "MO", "TSCO", "GM", "GE", "F", "AAL"]);

    this._url = `https://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in ("##default##")&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=`;
  }

  fetch (callback) {
    let readStamp = () => {
      fs.readFile("data/api/query.txt", "utf8", (err, data) => {
        try {
          data = JSON.parse(data);
          query(data);
        } catch (er) {
          data = {};
          console.log(er);
          //query(data);
        }
      });
    };

    let writeStamp = (storage, tickers, symbol) => {
      storage.lastChecked = new Date().getTime();

      if (!storage.tickers) storage.tickers = {};

      for (let x in tickers) {
        storage.tickers[x] = tickers[x];
      }

      fs.writeFile("data/api/query.txt", JSON.stringify(storage), function (err, data) {
        // console.log(e, d);
      });

      return storage.tickers[symbol];
    };

    let query = (storage) => {
      this._url = this._url.replace("##default##", this.tickers.join(","));

      callback(writeStamp(storage, [], this.tickers[0]), this.orderedList());
      new UI().drawSidebar(storage.tickers);

      $.ajax({
        url: this._url,
        type: "GET",
        callback: (response) => {
          response = JSON.parse(response).query.results.quote;
          response = this.process(response);

          let showcase = writeStamp(storage, response, this.tickers[0]);
          new UI().drawSidebar(response);

          callback(showcase, this.orderedList());
        },
        error: () => {
          callback(writeStamp(storage, [], this.tickers[0]), this.orderedList());
          new UI().drawSidebar(storage.tickers);
        }
      });

    };

    readStamp();

    return this;
  }

  process (data) {
    if (!this.data) this.data = {};

    data.forEach((o) => {
      for (let x in o) {
        if (o.hasOwnProperty(x)) {
          if (!isNaN(parseFloat(o[x])) && !/[A-z]/g.test(o[x])) {
            o[x] = parseFloat(o[x]);
          }
        }
      }

      this.data[o.Symbol] = this.formObject(o);
    });

    return this.data;
  }

  formObject (data) {

    return {
      ask: data.Ask ? data.Ask.toFixed(2) : "-",
      bid: data.Bid ? data.Bid.toFixed(2) : "-",
      bookValue: data.BookValue,
      change: data.Change,
      currency: data.Currency,
      daysHigh: data.DaysHigh ? data.DaysHigh.toFixed(2) : "-",
      daysLow: data.DaysLow ? data.DaysLow.toFixed(2) : "-",
      dividendYield: data.DividendYield ? data.DividendYield + "%" : "-",
      EBITDA: data.EBITDA,
      EPSEstCurrentYear: data.EPSEstimateCurrentYear,
      EPS: data.EarningsShare ? data.EarningsShare.toFixed(2) : "-",
      fiftyMovingAverage: data.FiftydayMovingAverage,
      marketCap: data.MarketCapitalization,
      name: data.Name,
      target: data.OneyrTargetPrice ? data.OneyrTargetPrice.toFixed(2) : "-",
      open: data.Open ? data.Open.toFixed(2) : "-",
      PEGRatio: data.PEGRatio ? data.PEGRatio.toFixed(2) : "-",
      PERatio: data.PERatio ? data.PERatio.toFixed(2) : "-",
      percentChange: data.PercentChange,
      priceBook: data.PriceBook,
      priceSales: data.PriceSales,
      symbol: data.Symbol,
      twoHundredMovingAverage: data.TwoHundreddayMovingAverage,
      volume: (data.Volume / 1000000).toFixed(2) + "M",
      yearHigh: data.YearHigh ? data.YearHigh.toFixed(2) : "-",
      yearLow: data.YearLow ? data.YearLow.toFixed(2) : "-",
      stockExchange: data.StockExchange
    };
  }

  orderedList () {
    return [
      ["Name", "name", true],
      ["Symbol", "symbol"],
      ["Ask", "ask"],
      ["Bid", "bid"],
      ["Percent Change", "percentChange"],
      ["Volume", "volume"],
      ["Market Cap", "marketCap"],
      ["Target Est.", "target"],
      ["Open", "open"],
      ["Day High", "daysHigh"],
      ["Day Low", "daysLow"],
      ["Div. Yield", "dividendYield"],
      ["EPS", "EPS"],
      ["PE Ratio", "PERatio"],
      ["PEG Ratio", "PEGRatio"],
      ["Price/Book", "priceBook"],
      ["Price/Sales", "priceSales"],
      ["Book Value", "bookValue"],
      ["50-Day Average", "fiftyMovingAverage"],
      ["200-Day Average", "twoHundredMovingAverage"],
      ["Year High", "yearHigh"],
      ["Year Low", "yearLow"]
    ];
  }
}
