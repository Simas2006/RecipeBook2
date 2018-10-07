var processing = false;

function addItem() {
  if ( processing ) return;
  processing = true;
  var req = new XMLHttpRequest();
  req.onload = function() {
    chrome.tabs.create({url: "http://10.0.1.11:4545"});
  }
  req.open("POST","http://10.0.1.11:4545/submit");
  chrome.tabs.query({active: true,lastFocusedWindow: true},function(tabs) {
    var url = tabs[0].url;
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
    chrome.tabs.create({url: "http://10.0.1.11:4545"});
  }
  document.getElementById("addItemButton").onclick = addItem;
}
