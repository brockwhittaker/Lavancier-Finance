var ChartRender = (function (sel, alert_sel) {
  var meta = {
    $container: $(sel),
    $alert: $(alert_sel)
  };

  var utils = {
    formatChartData: function (data, time) {
      for (var x = 0; x < data.length; x++) {
        if (data[x] <= 0) {
          data.splice(x, 1);
          time.splice(x, 1);
          x--;
        } else {
          data[x] = Math.round(data[x] * 100) / 100;
        }
      }

      return [data, time];
    }
  };

  var _Chart = function () {

  };

  _Chart.prototype = {
    // clear the old chart to not confuse users while new one loads..
    // displays the name of the new ticker that is loading.
    clear: (symbol) => {
      let canvas = meta.$container.find("canvas").el(0, true);

      if (canvas) {
        canvas.width = canvas.width;

        let context = canvas.getContext("2d");

        context.font = '300 32pt Roboto';
        context.textAlign = 'center';
        context.fillStyle = '#413C39';
        context.fillText(`Loading ${symbol}...`, canvas.width / 2, canvas.height / 2);
      }
    },

    // draw the chart into the selected canvas.
    draw: (data, time, ticker, isNew) => {
      let $container = meta.$container.find("div");
      let canvas = document.createElement("canvas");

      [data, time] = utils.formatChartData(data, time);

      console.log(data.length, time.length);

      $container
        .html("")
        .el(0, true).appendChild(canvas);

      meta.$alert
        .html(`&#9679; ${isNew ? "Updated Now" : "Cached Data"}`)
        .addClass(isNew ? "green" : "red")
        .removeClass(isNew ? "red" : "green");

      var myLineChart = new Chart(canvas.getContext("2d"), {
        type: 'line',
        data: {
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
        },
        options: {
          scales: {
            xAxes: [{
              ticks: {
                autoSkip: true
              }
            }]
          }
        }
      });

      widthQuery(0, 1000, () => {
        canvas.height = 300;
      });

      Chart.defaults.global.tooltips.callbacks.label = function (data) {
        return "$" + data.yLabel.toFixed(2);
      };
    }
  };

  return new _Chart();
});
