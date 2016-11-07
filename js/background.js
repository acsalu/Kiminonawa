var Constants = {
  w: 500,
  h: 500,
  x: 200,
  y: 200
};

var contentURL = '';

function cropData(str, coords, callback) {
  var img = new Image();

  img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = coords.w;
    canvas.height = coords.h;

    var ctx = canvas.getContext('2d');

    ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);

    callback({dataUri: canvas.toDataURL('image/png')});
  };

  img.src = str;
}

function capture(coords) {
  chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataUrl) {
    cropData(dataUrl, coords, function(data) {
      console.log("Done");
      var dataUri = data.dataUri;
      upload(dataUri);
    });
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  contentURL = tab.url;

  sendMessage({type: 'start-screenshots'}, tab);
});

chrome.extension.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  if (request.type == "coords") {
    capture(request.coords);
  } else if (request.type === 'screenshot-btn-clicked') {
    sendMessage({type: 'start-screenshots'}, tab);
  }

  sendResponse({}); // snub them.
}

function sendMessage(msg, tab) {
  console.log('sending message');

  chrome.tabs.sendMessage(tab.id, msg, function(response) {});
};

function upload(dataUri) {
  var fd = new FormData();
  var image64 = dataUri.replace(/data:image\/png;base64,/, '');

  fd.append('image', image64);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.imgur.com/3/image');
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('Authorization', 'Client-ID 8a228c904c872d9')
  xhr.onreadystatechange = function() {
    if (this.readyState == 4) {
      var response = JSON.parse(xhr.response);
      if (response.error) {
        alert('Error: ' + response.error.message);
        return;
      }
      var imageUrl = response.data.link;

      var win = window.open(imageUrl, '_blank');
      win.focus();
    }
  };
  xhr.send(fd);
}

function sendEmail(address, content) {
  address += "?subject=Name for Taiwan";
  address += ("&body=" + content);
  chrome.tabs.create({url: address}, function (tab) {
    setTimeout(function () {
      chrome.tabs.remove(tab.id);
    }, 500);
  });
}

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
