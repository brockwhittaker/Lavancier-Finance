var Fetch = (function (symbol, unit) {
  // instantiate the Store object to gain file access.
  var store = Store();

  var meta = {
    symbol: symbol,
    unit: unit
  };

  let utils = {
    filterToSize: function (arr, expected_size) {
      if (arr.length > expected_size) {
        var skip = Math.round(arr.length / expected_size);
      } else return arr;

      return arr.filter(function (o, i) {
        return (i % skip === 0);
      });
    }
  };

  // create the fetch class.
  var _Fetch = function () {

  };

  // create the prototype for publicly accessible fetch functions.
  _Fetch.prototype = {
    // get the historical data and run the charting function.
    getHistoricalData: function (callback) {
      var term = meta.unit;

      var interval = {
        "5d": function (d) { return `${d.month} ${d.d} ${d.h}:${d.fmt.mm}`; },
        "1m": function (d) { return `${d.month} ${d.d}`; },
        "3m": function (d) { return `${d.month} ${d.d}`; },
        "ytd": function (d) { return `${d.month} ${d.d}`; },
        "1y": function (d) { return `${d.month} ${d.d}`; },
        "2y": function (d) { return `${d.month} ${d.y}`; },
        "5y": function (d) { return `${d.month} ${d.y}`; },
        "10y": function (d) { return `${d.month} ${d.y}`; }
      };

      store.history.full(symbol, term, function (data, quant, list, isNew) {
        let open = utils.filterToSize(data[term].price, 500);

        let time = utils
          .filterToSize(data[term].time, 500)
          .map(function (o) {
            let d = $.moment(new Date(o * 1000));
            return interval[term](d);
          });

        callback(open, time, quant, list, symbol);
      });
    },

    getCurrentData: function (callback) {
      store.watchlist.get(function (tickers) {
        store.current.full(tickers.watchlist.concat(tickers.recent), function (data) {
          ui.updateSentiment(symbol);

          var sidebar = new Sidebar(tickers.watchlist, tickers.recent, data);
          sidebar.draw();

          callback(data);
        });
      });
    }
  };

  return new _Fetch();
});
