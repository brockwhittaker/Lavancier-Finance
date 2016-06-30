(() => {
  $("body").on("click", ".ind-ticker", function () {
    let $this = $(this);
    let ticker = $this.data("ticker");
    $(".ind-ticker").removeClass("selected");
    $this.addClass("selected");

    fetchQuote(ticker, "1y");
  });

  $("#submit_query").click(function () {
    let val = $(this).parent().find("input").val();

    if (val.length > 0) fetchQuote(val);
  });

  $("#add_new #submit").on("click", function () {
    let $input = $(this).parent().find("input"),
        val = $input.val();

    if (val.length > 0 && /^[A-z0-9\^\.]+/g.test(val)) {
      watchlist.add(val, () => {
        fetchQuote(val);
        $input.val("");
      });
    }
  });

  $(".chart-times ol li").click(function () {
    var unit = $(this).data("unit");

    fetchChart(meta.ticker, unit);
    $(".chart-times ol li").removeClass("selected");
    $(this).addClass("selected");
  });
})();
