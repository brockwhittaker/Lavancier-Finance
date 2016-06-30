var Sidebar = (function (watchlist, recent, data) {
  var meta = {
    tickers: watchlist,
    recent: recent
  };

  var _Sidebar = function () {

  };

  _Sidebar.prototype = {
    draw: () => {
      let $watchlist = $("#sidebar .tickers"),
          $recent = $("#sidebar .recent");

      [[$watchlist, watchlist], [$recent, recent]].forEach(function (o) {
        let tickers = o[1],
            $sidebar = o[0];

        tickers.forEach(function (ind) {
          let o = data[ind];

          let change = parseFloat(o.PercentChange);

          console.log(o);

          let symbol = o.symbol.replace(/[^A-Za-z0-9]/g, "");

          /* because of this, no symbol will repeat itself if it exists elsewhere.
          *  therefore, if AAPL is in the "watchlist", it won't also be in the
          *  "recent" category.
          */

          let $query = $(`[name='${symbol}']`);

          if ($query.length > 0) {
            $query.find(".ticker-name").html(o.Symbol);
            // if change is less than zero, add red-block class, else remove it.
            $query.find(".ticker-change")
              [change < 0 ? "addClass" : "removeClass"]("red-block");
            $query.find(".ticker-price")
              .html(parseFloat(o.Ask).toFixed(2));
          } else {
            let ind_ticker = $.create(`
              <div class="ind-ticker" data-ticker="${o.Symbol}" name="${symbol}">
                <div class="ticker-name">
                  ${o.Symbol}
                </div>
                <div class="ticker-change ${(change < 0) ? "red-block" : ""}">
                  ${change !== null ? change.toFixed(2) + "%" : "-"}
                </div>
                <div class="ticker-price">
                  ${parseFloat(o.Ask).toFixed(2)}
                </div>
                <div class="clear-float"></div>
              </div>`
            );

            $sidebar.append(ind_ticker);
          }
        });
      });
    }
  };

  return new _Sidebar();
});

var CurrentFinance = (function () {
  var utils = {

  };

  var _CurrentFinance = function () {

  };

  _CurrentFinance.prototype = {
    format: function (data) {
      for (var x in data) {
        data[x] = !isNaN(data[x]) ? parseFloat(data[x]) : data[x];
      }


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
        percentChange: data.PercentChange ? parseFloat(data.PercentChange).toFixed(2) + "%" : "-",
        priceBook: data.PriceBook,
        priceSales: data.PriceSales,
        symbol: data.Symbol,
        twoHundredMovingAverage: data.TwoHundreddayMovingAverage,
        volume: (data.Volume / 1000000).toFixed(2) + "M",
        yearHigh: data.YearHigh ? data.YearHigh.toFixed(2) : "-",
        yearLow: data.YearLow ? data.YearLow.toFixed(2) : "-",
        stockExchange: data.StockExchange
      };
    },

    list: function () {
      return [
        ["Name", "name", true],
        ["Symbol", "symbol"],
        ["Ask", "ask"],
        ["Bid", "bid"],
        ["Percent Change", "percentChange", false, function (value) {
          return (parseFloat(value) > 0) ? "green" : "red";
        }],
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
  };

  return new _CurrentFinance();
});
