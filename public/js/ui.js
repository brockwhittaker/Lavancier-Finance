class UI {
  drawTickerStats (data, list) {
    let $stat_container = $("#body #fundamentals");

    $stat_container.html("");

    if (data) {
      list.forEach((stat, i) => {
        let ind_stat = $.create(`
          <div class='ind-stat ${(stat[2]) ? "large" : ""}'>
            <div class='stat-title'>${stat[0]}</div>
            <div class='stat-value'>${(typeof data[stat[1]] !== "undefined" && data[stat[1]] !== null) ? data[stat[1]] : "-"}</div>
          </div>
        `);

        $stat_container.append(ind_stat);
      });
    }
  }

  drawSidebar (data) {
    let $sidebar = $("#sidebar .tickers");

    for (var x in data) {
      let o = data[x];

      let symbol = o.symbol.replace(/[^A-Za-z0-9]/g, "");

      if ($(`[name=${symbol}]`).length > 0) {
        $(`[name=${symbol}]`).html(`
          <div class="ticker-name">
            ${o.symbol}
          </div>
          <div class="ticker-change ${(parseFloat(o.percentChange) < 0) ? "red-block" : ""}">
            ${o.percentChange !== null ? o.percentChange.toFixed(2) + "%" : "-"}
          </div>
          <div class="ticker-price">
            ${o.ask}
          </div>
          <div class="clear-float"></div>
        `);
      } else {
        let ind_ticker = $.create(`<div class="ind-ticker" data-ticker="${o.symbol}" name="${symbol}">
            <div class="ticker-name">
              ${o.symbol}
            </div>
            <div class="ticker-change ${(parseFloat(o.percentChange) < 0) ? "red-block" : ""}">
              ${o.percentChange !== null ? o.percentChange.toFixed(2) + "%" : "-"}
            </div>
            <div class="ticker-price">
              ${o.ask}
            </div>
            <div class="clear-float"></div>
          </div>`);

        $sidebar.append(ind_ticker);
      }
    }
  }
}
