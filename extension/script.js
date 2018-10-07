var processing = false;
var IP = "http://10.0.1.126:4545";

function addItem() {
  if ( processing ) return;
  processing = true;
  var req = new XMLHttpRequest();
  req.onload = function() {
    chrome.tabs.create({url: IP});
  }
  chrome.tabs.query({active: true,lastFocusedWindow: true},function(tabs) {
    var url = tabs[0].url;
    req.open("PUT",`${IP}/submit`);
    req.send(`${url},${document.getElementById("name").value}`);
    document.getElementById("processingText").innerText = "Processing";
    document.getElementById("name").disabled = "disabled";
    var dotCount = 0;
    setInterval(function() {
      dotCount++;
      if ( dotCount > 3 ) dotCount = 0;
      document.getElementById("processingText").innerText = "Processing" + ".".repeat(dotCount);
    },333);
  });
}

window.onload = function() {
  document.getElementById("mainPageButton").onclick = function() {
    chrome.tabs.create({url: IP});
  }
  document.getElementById("addItemButton").onclick = addItem;
}
