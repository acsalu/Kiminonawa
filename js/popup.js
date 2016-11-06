document.addEventListener('DOMContentLoaded', function() {
  var screenshotBtn = document.getElementById('screenshot-btn');
  screenshotBtn.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabArray) {
      var tab = tabArray[0];
      chrome.tabs.sendMessage(tab.id, {type: 'start-screenshots'}, function(response) {
        window.close();
      });
    });
  });

  var reportBtn = document.getElementById('report-button');
  reportBtn.addEventListener('click', function() {
    var address = $('#email-addresses').val();
    var content = $('#email-content-p').text();
    chrome.extension.getBackgroundPage().sendEmail(address, content);
  });
});

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  if (request.from === 'content') {
    if (request.subject === 'mailAddresses') {
      var mailAddresses = request.data;
      for (var i = 0; i < mailAddresses.length; ++i) {
        var optionHTML = "<option ";
        optionHTML += "value=" + mailAddresses[i] + ">"
        optionHTML += mailAddresses[i].substr('mailto:'.length);
        optionHTML += "</option";
        $('#email-addresses').append(optionHTML);
      }
    }
  }
  sendResponse({});
}

