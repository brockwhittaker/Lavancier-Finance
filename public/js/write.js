var Store = (function () {
  let fs = require("fs");

  var storageLocations = {
    "history": function (ticker) {
      return `data/api/history.${ticker}.txt`;
    },
    "current": function () {
      return `data/api/current.txt`;
    },
    "watchlist": function () {
      return `data/api/watchlist.txt`;
    }
  };

  var operations = {
    write: (location, ticker, data, callback) => {
      // if the location isn't in the object, throw an error and don't continue.
      // that means that the path is not defined as a valid route for writing.
      if (!storageLocations[location]) throw "Error. Location not found.";

      // if the data is still not stringified, stringify it.
      if (typeof data == "object") data = JSON.stringify(data);

      fs.writeFile(storageLocations[location](ticker), data, function (err, d) {
        if (callback) callback();
      });
    },

    read: (location, ticker, callback) => {
      // if the location isn't in the object, throw an error and don't continue.
      // that means that the path is not defined as a valid route for writing.
      if (!storageLocations[location]) throw "Error. Location not found.";

      // read the file in 'utf8' and get data in the callback.
      // attempt to parse the data, and then run a callback with either the data
      // or with an empty object.
      fs.readFile(storageLocations[location](ticker), "utf8", function (err, data) {
        try {
          data = JSON.parse(data);
        } catch (er) {
          data = {};
        } finally {
          if (callback) callback(data);
        }
      });
    },

    range: (unit) => {
      // set a new date from the current moment.
      var date = new Date();

      // set the intervals equivalents for searching Yahoo! Finance.
      var interval = {
        "5d": {unit: "1m", len: 5},
        "1m": {unit: "5m", len: 31},
        "3m": {unit: "5m", len: 62},
        "ytd": {unit: "1d", len: (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)},
        "1y": {unit: "1d", len: 365},
        "2y": {unit: "1d", len: 365 * 2},
        "5y": {unit: "1wk", len: 365 * 5},
        "10y": {unit: "1wk", len: 365 * 10}
      };

      let d = new Date().getTime() / 1000;

      return {start: (d - (60 * 60 * 24 * (interval[unit].len))).toFixed(0), end: d.toFixed(0), unit: interval[unit].unit};
    },

    // actually AJAX fetch the results from Yahoo! Finance.
    // filter down the results
    history: (ticker, unit, callback) => {
      let r = operations.range(unit);

      let url = `https://finance-yql.media.yahoo.com/v7/finance/chart/${ticker}?period2=${r.end}&period1=${r.start}&interval=${r.unit}&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn&corsDomain=finance.yahoo.com`;

      $.get(url, function (data) {
        data = JSON.parse(data).chart.result[0];

        let pricing = {
          price: data.indicators.quote[0].open,
          time: data.timestamp
        };

        callback(pricing);
      });
    },

    current: (tickers, callback) => {
      let url = `https://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in ("${tickers.join(",")}")&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=`;


      $.get(url, function (data) {
        data = JSON.parse(data).query.results.quote;
        let map = {};

        if (Array.isArray(data)) {
          data.forEach((o) => {
            map[o.symbol] = o;
          });
        } else {
          map[data.symbol] = data;
        }

        callback(map);
      });
    },

    // if a valid number (not null, NaN, undefined), keep in the array.
    filter: (data) => {
      return data.filter((o) => {
        return !isNaN(o);
      });
    },

    // calculate stats on price, volatility, skewness, and kurtosis.
    // this relies on the $.quant object in my toolkit to calculate stats.
    calculate: (data) => {
      let residuals = operations.filter($.quant.residuals(data));
      // change the volatility to represent the dataset later.
      let volatility = operations.filter($.quant.rollingVolatility(residuals, 50, 1));
      let skewness = operations.filter($.quant.rollingSkewness(data, 50));
      let kurtosis = operations.filter($.quant.rollingKurtosis(data, 50));

      return {
        price: {
          max: Math.max.apply(null, data),
          min: Math.min.apply(null, data),
          latest: data[data.length - 1]
        },
        volatility: {
          max: Math.max.apply(null, volatility),
          min: Math.min.apply(null, volatility),
          latest: volatility[volatility.length - 1]
        },
        skewness: {
          max: Math.max.apply(null, skewness),
          min: Math.min.apply(null, skewness),
          latest: skewness[skewness.length - 1]
        },
        kurtosis: {
          max: Math.max.apply(null, kurtosis),
          min: Math.min.apply(null, kurtosis),
          latest: kurtosis[kurtosis.length - 1]
        }
      };
    },

    // form an object of formatted statistics.
    formObject: (data) => {
      let [price, volatility, skewness, kurtosis] = [data.price, data.volatility, data.skewness, data.kurtosis];

      return {
        price: price.latest.toFixed(2),
        priceMin: price.min.toFixed(2),
        priceMax: price.max.toFixed(2),
        volatility: (volatility.latest * 100).toFixed(2) + "%",
        volatilityMin: (volatility.min * 100).toFixed(2) + "%",
        volatilityMax: (volatility.max * 100).toFixed(2) + "%",
        skewness: skewness.latest.toFixed(4),
        skewnessMin: skewness.min.toFixed(4),
        skewnessMax: skewness.max.toFixed(4),
        kurtosis: kurtosis.latest.toFixed(4),
        kurtosisMin: kurtosis.min.toFixed(4),
        kurtosisMax: kurtosis.max.toFixed(4),
      };
    },

    orderedList: () => {
      return [
        ["Last Price", "price"],
        ["Min Price", "priceMin"],
        ["Max Price", "priceMax"],
        ["Last Volatility", "volatility"],
        ["Min Volatility", "volatilityMin"],
        ["Max Volatility", "volatilityMax"],
        ["Last Skewness", "skewness"],
        ["Min Skewness.", "skewnessMin"],
        ["Max Skewness", "skewnessMax"],
        ["Last Kurtosis", "kurtosis"],
        ["Min Kurtosis", "kurtosisMin"],
        ["Max Kurtosis", "kurtosisMax"]
      ];
    }
  };

  var _Store = function () {

  };

  _Store.prototype = {
    history: {
      get: function (ticker, callback) {
        operations.read("history", ticker, function (data) {
          callback(data);
        });
      },
      set: function (ticker, unit, data) {
        this.get(ticker, function (d) {
          d[unit] = data;

          operations.write("history", ticker, d);
        });
      },

      update: function (ticker, unit) {
        operations.history(ticker, unit, (data) => {
          this.set(ticker, unit, data);
        });
      },

      full: function (ticker, unit, callback) {
        // where to store the data that is retrieved.
        //  - read: previously written information.
        //  - history: retrieved new info for unit online.
        let meta = {
          read: null,
          history: null
        };

        // a final callback to run once both `read` and `history` are complete.
        var final = () => {
          if (meta.read && meta.history) {
            meta.read[unit] = meta.history;

            //var quant = this.calculate(meta.history.price);
            var formatted = operations.formObject(
              operations.calculate(meta.history.price)
            );

            callback(
              meta.read,
              formatted,
              operations.orderedList(),
              true
            );
          }
        };

        operations.read("history", ticker, (response) => {
          meta.read = response;
          final();
        });

        operations.history(ticker, unit, (response) => {
          meta.history = response;
          // set the new data composite.
          this.set(ticker, unit, response);
          final();
        });
      }
    },

    current: {
      get: function (callback) {
        operations.read("current", null, function (data) {
          callback(data);
        });
      },

      set: function (data) {
        operations.write("current", null, data);
      },

      // the 'full' function is equivalent to `update`.
      // read the current object of ticker data.
      // update and fill new information.
      full: function (tickers, callback) {
        this.get((data) => {
          operations.current(tickers, (d) => {
            for (var x in d) {
              data[x] = d[x];
            }

            this.set(data);
            callback(data);
          });
        });
      }
    },

    watchlist: {
      get: function (callback) {
        operations.read("watchlist", null, function (data) {
          callback(data);
        });
      },

      add: function (tickers, recent, callback) {
        this.get(function (data) {
          // if the data.watchlist doesn't exist yet, create a new array.
          if (!data.watchlist) data.watchlist = [];
          if (!data.recent) data.recent = [];

          // add the tickers if they don't exist in the watchlist already.
          tickers.forEach(function (o) {
            if (data.watchlist.indexOf(o) == -1) {
              data.watchlist.push(o);
            }
          });

          // add the recent as arguments.
          recent.forEach(function (o) {
            if (data.recent.indexOf(o) == -1) {
              data.recent.push(o);
            }
          });

          // write the data to the watchlist txt file.
          operations.write("watchlist", null, data);

          callback(data);
        });
      },
    }
  };

  return new _Store();
});
