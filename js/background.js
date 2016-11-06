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