function scrollIntoView (element, alignTop) {

  console.log("Scroll into view");

  var document = element.ownerDocument;
  var origin = element, originRect = origin.getBoundingClientRect();
  var hasScroll = false;
  var documentScroll = document.scrollingElement;

  while (element) {
    if (element == document.body) {
      element = documentScroll;
    } else {
      element = element.parentNode;
    }

    if (element) {
      var hasScrollbar = (!element.clientHeight)?
          false : element.scrollHeight > element.clientHeight;
      if (!hasScrollbar) {
        if (element == documentScroll) {
          element = null;
        }
        continue;
      }
      var rects;
      if (element == documentScroll) {
        rects = {
          left: 0,
          top: 0
        };
      } else {
        rects = element.getBoundingClientRect();
      }

      // check that elementRect is in rects
      var deltaLeft =
          originRect.left -
          (rects.left + (parseInt(element.style.borderLeftWidth, 10) | 0));
      var deltaRight = 
          originRect.right -
          (rects.left + element.clientWidth +
           (parseInt(element.style.borderLeftWidth, 10) | 0));
      var deltaTop =
          originRect.top -
          (rects.top + (parseInt(element.style.borderTopWidth, 10) | 0));
      var deltaBottom =
        originRect.bottom -
        (rects.top + element.clientHeight +
         (parseInt(element.style.borderTopWidth, 10) | 0));

      // adjust display depending on deltas
      if (deltaLeft < 0) {
        element.scrollLeft += deltaLeft;
      } else if (deltaRight > 0) {
        element.scrollLeft += deltaRight;
      }

      if (alignTop === true && !hasScroll) {
        element.scrollTop += deltaTop;
      } else if (alignTop === false && !hasScroll) {
        element.scrollTop += deltaBottom;
      } else {
        if (deltaTop < 0) {
          element.scrollTop += deltaTop;
        } else if (deltaBottom > 0) {
          element.scrollTop += deltaBottom;
        }
      }

      if (element == documentScroll) {
        element = null;
      } else {
        // readjust element position after scrolls, and check if vertical scroll
        // has changed. This is required to perform only one alignment
        var nextRect = origin.getBoundingClientRect();
        if (nextRect.top != originRect.top) {
          hasScroll = true;
        }
        originRect = nextRect;
      }
    }
  }

    // put the element into middle of the view
    console.log("QQ");
    document.body.scrollTop -= screen.height/2;

}

var parser = {};
// Return the node containing the DOM path leading to the html object containing
// offending pattern e.g. Taiwan, Province of China.
parser.getOffendingNode = function() {
  var crawlerPromise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(parser.traverse_(document.body));
    }, 3000)
  })
  return crawlerPromise;
};
parser.getOffendingText = function(node) {
  return parser.matchOffending_(parser.getText_(node));
};
// Private methods.
parser.traverse_ = function(node) {
  for (var x = 0; x < node.children.length; ++x) {
    var offendingChildNode = parser.traverse_(node.children[x]);
    if (offendingChildNode) {
      return offendingChildNode;
    }
  }

  if (node.nodeName == 'SCRIPT' ||
      node.nodeName == 'TITLE') {
    return null;
  }
  var text = parser.getText_(node);
  if (text) {
    var offendingText = parser.matchOffending_(text);
    if (offendingText) {
      console.log('Tag name: ' + node.nodeName);
      console.log('Offending text: ' + offendingText);
      return node;
    }
  }
  return null;
};
parser.getText_ = function(node) {
  if (!node) {
    return '';
  }
  var text;
  if (node.nodeName[0] == 'H' && node.nodeName.length == 2) {
    text = node.textContent;
  } else if (node.nodeName == 'A' || node.nodeName == 'SPAN') {
    text = node.innerText;
  } else if (node.nodeName == 'STRONG' || node.nodeName == 'P') {
    text = node.textContent;
  } else {
    text = node.text;
  }
  return text;
};

parser.patterns_ = [
  new RegExp('taiwan\\s*,?\\s*province\\s*of\\s*china', 'i'),
  new RegExp('taiwan\\s*,?\\s*prc', 'i'),
  new RegExp('chinese\\s*,?\\s*taipei', 'i'),
  new RegExp('taiwan\\s*,?\\s*china', 'i'),
  new RegExp('china\\s*,?\\s*taiwan', 'i')
];

parser.matchOffending_ = function(text) {
  for (var x = 0; x < parser.patterns_.length; ++x) {
    var re = parser.patterns_[x];
    if (text.match(re)) {
      return text;
    }
  }
  return false;
};

var highlightText = function(highlightText) {

  // add style to element
  this.style.textDecoration = "line-through";

  // check if the found pattern is in a long paragraph
  var parent_text = $(this.parentNode).text();
  var _ele = this;
  var parent;
  if (parent_text.length > 100){
    this.parentNode.innerHTML = this.parentNode.innerHTML.replace( this.outerHTML,
      "<div class='offending-text'>" + this.outerHTML + "</div>" );
    parent = document.getElementsByClassName("offending-text")[0];
  }else{
    console.log(this.parentNode);
    parent = this.parentNode;
  }

  // add style to parent element
  parent.style.cssText = 'border: 3;border-style: solid; border-color: #d11212; text-decoration: line-through; display: inline-block;';

  // scroll element into view
  $(document).ready(function(){
    scrollIntoView(parent, true);
  });

  // fade in fade out calling each other for ever
  var fadeOut = function(el) {
    el.style.opacity = 1;

    (function fade() {
      if ((el.style.opacity -= .04) < 0) {
        fadeIn(el);
      } else {
        requestAnimationFrame(fade);
      }
    })();
  };

  var fadeIn = function(el) {
    el.style.opacity = 0;

    (function fade() {
      var val = parseFloat(el.style.opacity);
      if (!((val += .04) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      } else {
        fadeOut(el);
      }
    })();
  };

  // start animation of fade in and fade out
  fadeOut(parent);
};

var whitelist = [
  'www.google.com',
  'www.facebook.com'
];

chrome.runtime.onMessage.addListener(function (msg, sender) {
  if ((msg.from === 'background') && (msg.subject === 'HostNameAck')) {
    console.log('Received ACK from background.');
    if (msg.visited === true) {
      console.log('This website has been visited');
    } else {
      console.log('This website has not been visited');
    }
  }
});

$(function() {
  var hostName = window.location.host;
  if (whitelist.indexOf(hostName) >= 0) {
    console.log('Website is whitelisted: ' + hostName);
    return;
  }
  chrome.runtime.sendMessage({
    from: 'content',
    subject: 'HostName',
    text: hostName
  });

  var baseUrl = getBaseUrl(location.href);
  parser.getOffendingNode()
  .then(offendingNode => {
    if (offendingNode !== null) {
      var offendingText = parser.getOffendingText(offendingNode);
      highlightText.call(offendingNode, offendingText);

      const cp = new ContactParser(baseUrl, $(document));
      cp.findMailAddresses(function(mailAddresses) {
        for (var i = 0; i < mailAddresses.length; ++i) {
          console.log(mailAddresses[i]);
        }
        chrome.runtime.sendMessage({
          from:    'content',
          subject: 'mailAddresses',
          data: mailAddresses
        });

      });
    }}
  );
});

function getBaseUrl(origUrl) {
  var pathArray = origUrl.split('/');
  var protocol = pathArray[0];
  var host = pathArray[2];
  return protocol + '//' + host;
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  if (request.type == "start-screenshots") {
    startScreenshot();
  }
  sendResponse({});
}


function startScreenshot() {
  console.log('start screenshot');
  //change cursor
  document.body.style.cursor = 'crosshair';

  document.addEventListener('mousedown', mouseDown, false);
  document.addEventListener('keydown', keyDown, false);
}

function endScreenshot(coords) {
  document.removeEventListener('mousedown', mouseDown, false);

  sendMessage({type: 'coords', coords: coords});
}

function sendMessage(msg) {
  //change cursor back to default
  document.body.style.cursor = 'default';

  console.log('sending message with screenshoot');
  chrome.runtime.sendMessage(msg, function(response) {});
};

//
// end messages
//

var ghostElement, startPos, gCoords, startY;

function keyDown(e) {
  var keyCode = e.keyCode;

  // Hit: n
  if ( keyCode == '78' && gCoords ) {
    e.preventDefault();
    e.stopPropagation();

    endScreenshot(gCoords);

    return false;
  }
}

function mouseDown(e) {
  e.preventDefault();

  startPos = {x: e.pageX, y: e.pageY};
  startY = e.y;

  ghostElement = document.createElement('div');
  ghostElement.style.background = 'blue';
  ghostElement.style.opacity = '0.1';
  ghostElement.style.position = 'absolute';
  ghostElement.style.left = e.pageX + 'px';
  ghostElement.style.top = e.pageY + 'px';
  ghostElement.style.width = "0px";
  ghostElement.style.height = "0px";
  ghostElement.style.zIndex = "1000000";
  document.body.appendChild(ghostElement);

  document.addEventListener('mousemove', mouseMove, false);
  document.addEventListener('mouseup', mouseUp, false);

  return false;
}

function mouseUp(e) {
  e.preventDefault();

  var nowPos = {x: e.pageX, y: e.pageY};
  var diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};

  document.removeEventListener('mousemove', mouseMove, false);
  document.removeEventListener('mouseup', mouseUp, false);

  ghostElement.parentNode.removeChild(ghostElement);

  setTimeout(function() {
    var coords = {
      w: diff.x,
      h: diff.y,
      x: startPos.x,
      y: startY
    };
    gCoords = coords;
    endScreenshot(coords);
  }, 50);

  return false;
}

function mouseMove(e) {
  e.preventDefault();

  var nowPos = {x: e.pageX, y: e.pageY};
  var diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};

  ghostElement.style.width = diff.x + 'px';
  ghostElement.style.height = diff.y + 'px';

  return false;
}

