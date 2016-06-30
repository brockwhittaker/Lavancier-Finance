let fs = require("fs");

let watchlist = new Watchlist();
let ui = new UI();

let meta = {
  ticker: "AAPL",
  unit: "1y"
};

let widthQuery = (min, max, callback) => {
  if (window.innerWidth > min &&
      window.innerWidth < max) {
        callback();
  }
};

(function () {
  window.fetchQuote = (symbol, unit) => {
    var fetch = new Fetch(symbol, unit);
    var chart = new ChartRender("#chart_container", "#new_alert");
    var finance = new CurrentFinance();
    var ui = new UI();

    meta.ticker = symbol;
    meta.unit = unit;

    chart.clear(symbol);

    fetch.getHistoricalData((price, time, quant, list, symbol) => {
      chart.draw(price, time, symbol, true);
      ui.drawQuantStats(quant, list);
    });

    fetch.getCurrentData((data) => {
      var formatted = finance.format(data[symbol]);
      var list = finance.list();

      ui.drawTickerStats(formatted, list);
    });
  };

  window.fetchChart = (symbol, unit) => {
    var fetch = new Fetch(symbol, unit);
    var chart = new ChartRender("#chart_container", "#new_alert");
    var ui = new UI();

    chart.clear(symbol);

    fetch.getHistoricalData((price, time, quant, list, symbol) => {
      chart.draw(price, time, symbol, true);
      ui.drawQuantStats(quant, list);
    });
  };

  fetchQuote(meta.ticker,  meta.unit);
})();
