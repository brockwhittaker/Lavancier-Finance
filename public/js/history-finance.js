class HistoricalPricing {
  constructor (ticker) {
    this.ticker = ticker;
    this.url = `https://finance-yql.media.yahoo.com/v7/finance/chart/${ticker}?period2=1463739677&period1=1463394077&interval=1m&indicators=quote&includeTimestamps=true&includePrePost=true&events=div%7Csplit%7Cearn&corsDomain=finance.yahoo.com`;
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

          data[this.ticker] = response;

          console.log(false);
          callback(data[this.ticker], true);

          this.write(data);
        },
        error: () => {
          console.log(true);
          callback(data[this.ticker], false);
        }
      });
    });
  }
}
