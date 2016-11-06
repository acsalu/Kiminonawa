chrome.runtime.onMessage.addListener(function (msg, sender) {
  if ((msg.from === 'content') && (msg.subject === 'HostName')) {
    console.log("background received hostname: " + msg.text);

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      var visited = false;
      var hostName = msg.text;
      searchHistory(hostName, tabs);
    });
  }
});

var searchHistory = function (hostName, tabs) {
  chrome.history.search({
    'text': hostName,
    'maxResults': 1
  }, function (historyItems) {
    var visited = false;
    if (historyItems.length) {
      for (var x = 0; x < historyItems.length; ++x) {
        console.log('history: ' + historyItems[x]);
      }
      visited = true;
    }
    chrome.tabs.sendMessage(
      tabs[0].id, {
        'from': 'background',
        'subject': 'HostNameAck',
        'visited': visited
      });
  });
};
