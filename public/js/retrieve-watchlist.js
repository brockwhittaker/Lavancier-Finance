class Watchlist {
  /* accepts a callback that returns the watchlist in array format. */
  retrieve (callback) {
    fs.readFile("data/api/watchlist.txt", "utf8", (err, data) => {
      if (!err) {
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = ["^GSPC", "AAPL", "CRM", "TGT"];
          this.write(data);
        } finally {
          callback(data);
        }
      } else {
        data = ["^GSPC", "AAPL", "CRM", "TGT"];
        this.write(data);
        callback(data);
      }
    });
  }

  /* accepts an array of equities. */
  write (data, callback) {
    let output = JSON.stringify(data);

    fs.writeFile("data/api/watchlist.txt", output, (err, response) => {
      if (err) {
        callback(data, err);
        console.log("Error in writing Watchlist: " + err);
      } else {
        callback(data, err);
        console.log("Watchlist successfully updated.");
      }
    });
  }

  add (ticker, callback) {
    this.retrieve((data) => {
      // if the ticker isn't already in the list, add it.
      if (data.indexOf(ticker) == -1) {
        this.write(data.concat(ticker), callback);
      } else {
        callback(data, {error: "The ticker already exists in the list."});
      }
    });
  }

  remove (ticker, callback) {
    this.retrieve((data) => {
      let index = data.indexOf(ticker);

      if (index > -1) {
        data.slice(ticker, index);
      }
      this.write(data, callback);
    });
  }
}
