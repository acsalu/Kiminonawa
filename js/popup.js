document.addEventListener('DOMContentLoaded', function() {
  var screenshotBtn = document.getElementById('screenshot-btn');
  // onClick's logic below:
  screenshotBtn.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabArray) {
      var tab = tabArray[0];
      chrome.tabs.sendMessage(tab.id, {type: 'start-screenshots'}, function(response) {
        window.close();
      });
    });
  });
});

