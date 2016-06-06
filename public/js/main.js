let fs = require("fs");

let widthQuery = (min, max, callback) => {
  if (window.innerWidth > min &&
      window.innerWidth < max) {
        callback();
  }
};

(function () {
  let clearChart = (symbol) => {
    let canvas = $("#chart_container canvas").el(0, true);
    if (canvas) {
      canvas.width = canvas.width;

      let context = canvas.getContext("2d");

      context.font = '300 32pt Roboto';
      context.textAlign = 'center';
      context.fillStyle = '#413C39';
      context.fillText(`Loading ${symbol}...`, canvas.width / 2, canvas.height / 2);
    }
  };

  window.fetchQuote = (symbol) => {
    let ticker = {
      stats: new CurrentStats(symbol),
      pricing: new HistoricalPricing(symbol)
    };

    let ui = new UI();

    // clear the old chart to not confuse users while new one loads..
    clearChart(symbol);

    ticker.stats.fetch(function (data, list) {
      if (data) {
        ui.drawTickerStats(data, list);
      }
    });

    ticker.pricing.fetch(function (data, quant, list, isNew) {
      if (data) {
        let open = data.indicators.quote[0].open.filter(function (o, i) {
          return (i % 5 === 0);
        });

        let time = data.timestamp.filter(function (o, i) {
          return (i % 5 === 0);
        }).map(function (o) {
          let d = $.moment(new Date(o * 1000));

          return `${d.month} ${d.d} ${d.h}:${d.fmt.mm}`;
        });

        chart(open, time, data.meta.symbol, isNew);
      }

      if (quant) {
        ui.drawQuantStats(quant, list);
      }
    });
  };

  fetchQuote("AAPL");
})();

let chart = (data, time, ticker, isNew) => {
  let $container = $("#chart_container div");
  var settings = {
      labels: time,
      datasets: [
          {
              label: `${ticker} Price`,
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(28, 148, 148, 0.4)",
              borderColor: "rgba(28, 148, 148, 0.8)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(28, 148, 148, 1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: data,
          }
      ]
  };

  Chart.defaults.global.tooltips.callbacks.label = function (data) {
    return "$" + data.yLabel.toFixed(2);
  };

  var canvas = document.createElement("canvas");

  widthQuery(0, 1000, () => {
    canvas.height = 300;
  });


  $container.html("");
  $("#new_alert").html(`&#9679; ${isNew ? "Updated Now" : "Cached Data"}`);
  $("#new_alert")
    .addClass(isNew ? "green" : "red")
    .removeClass(isNew ? "red" : "green");

  $container.el(0, true).appendChild(canvas);

  var myLineChart = new Chart(canvas.getContext("2d"), {
      type: 'line',
      data: settings,
      options: {
        scales: {
          xAxes: [{
            ticks: {
              autoSkip: true
            }
          }]
        },
        tooltipTemplate: function (value) {
          // console.log(value);
        }
      }
  });
};

(() => {
  $("body").on("click", ".ind-ticker", function () {
    let $this = $(this);
    let ticker = $this.data("ticker");
    $(".ind-ticker").removeClass("selected");
    $this.addClass("selected");

    fetchQuote(ticker);
  });
})();
