class HistoricalPricing {
  // if weekly_view is 'true', then it will show ~ 5 days of data,
  // otherwise it shows a year worth of data.
  constructor (ticker, weekly_view) {
    let range = (DAILY) => {
      let d = new Date().getTime() / 1000;

      return {start: (d - (60 * 60 * 24 * ((DAILY) ? 4 : 365))).toFixed(0), end: d.toFixed(0)};
    };

    let r = range(weekly_view);
    // console.log(r.start, r.end);

    this.ticker = ticker;
    this.url = `https://finance-yql.media.yahoo.com/v7/finance/chart/${ticker}?period2=${r.end}&period1=${r.start}&interval=${weekly_view ? "1m" : "1d"}&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn&corsDomain=finance.yahoo.com`;
    //this.url = `https://finance-yql.media.yahoo.com/v7/finance/chart/${ticker}?period2=${r.end}&period1=${r.start}&interval=1d&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn&corsDomain=finance.yahoo.com`;
  }

  read (callback) {
    fs.readFile("data/api/charts.txt", "utf8", function (err, data) {
      try {
        data = JSON.parse(data);
        callback(data);
      } catch (er) {
        console.log(data, er);
        callback ({});
      }
    });
  }

  write (data) {
    fs.writeFile("data/api/charts.txt", JSON.stringify(data), function (err, data) {
      // console.log(err, data);
    });
  }

  fetch (callback) {

    this.read((data) => {
      //callback(data[this.ticker]);

      $.ajax({
        url: this.url,
        type: "GET",
        callback: (response) => {
          response = JSON.parse(response).chart.result[0];
          this.data = response;

          this.dataGranularity = this.data.meta.dataGranularity;
          console.log("granularity", this.dataGranularity);

          if (typeof data[this.ticker] !== "object") data[this.ticker] = {};

          data[this.ticker][this.dataGranularity] = response;

          let quant = this.calculate(data[this.ticker][this.dataGranularity]);
          let processed = this.formObject(quant);

          callback(
            data[this.ticker],
            processed,
            this.orderedList(),
            true
          );

          this.write(data);
        },
        error: () => {
          callback(data[this.ticker], false);
        }
      });
    });
  }

  calculate (data) {
    data = data.indicators.quote[0].open;

    let filter = (data) => {
      return data.filter((o) => {
        return !isNaN(o);
      });
    };

    let residuals = filter($.quant.residuals(data));
    let volatility = filter($.quant.rollingVolatility(residuals, 50, this.dataGranularity == "1d" ? 1 : 1 / (60*8.5)));
    let skewness = filter($.quant.rollingSkewness(data, 50));
    let kurtosis = filter($.quant.rollingKurtosis(data, 50));

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
  }

  formObject (data) {
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
  }

  orderedList () {
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
}
