function scrollIntoView (element, alignTop) {
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
  document.body.scrollTop -= screen.height/2;
}

var parser = {};
// Return the node containing the DOM path leading to the html object containing
// offending pattern e.g. Taiwan, Province of China.
parser.getOffendingNode = function() {
  return parser.traverse_(document);
};
parser.getOffendingText = function(node) {
  return parser.matchOffending_(parser.getText_(node));
};
// Private methods.
parser.traverse_ = function(node) {
  for (var x = 0; x < node.children.length; ++x) {
    var child = parser.traverse_(node.children[x]);
    if (child) {
      return child;
    }
  }

  if (node.tagName == 'SCRIPT' ||
      node.tagName == 'TITLE') {
    return null;
  }
  var text = parser.getText_(node);
  if (text) {
    var offendingText = parser.matchOffending_(text);
    if (offendingText) {
      console.log('Offending text: ' + offendingText);
      return node;
    }
  }
  return null;
};
parser.getText_ = function(node) {
  var text = node.text;
  if (node.tagName == 'H2') {
    text = node.textContent;
  } else if (node.tagName == 'A') {
    text = node.innerText;
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

var highlightText = function() {

  // add style to element
  this.style.textDecoration = "line-through";

  // add style to parent element
  var parent = this.parentElement;
  parent.style.cssText = 'border: 3;border-style: solid; border-color: #d11212; text-decoration: line-through;';

  // check if element in view, scroll in to view if not.
  var _ele = this;
  $(document).ready(function(){
    scrollIntoView(_ele, true);  
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

$(function() {
  var baseUrl = getBaseUrl(location.href);
  var offendingNode = parser.getOffendingNode();
  var offendingText = parser.getOffendingText(offendingNode);
  if (offendingNode) {
    highlightText.call(offendingNode);
  }
  if (offendingNode !== null) {
    const cp = new ContactParser(baseUrl, $(document));
    cp.findMailAddresses(function(mailAddresses) {
      for (var i = 0; i < mailAddresses.length; ++i) {
        console.log(mailAddresses[i]);
      }
    });
  }
});

function getBaseUrl(origUrl) {
  var pathArray = origUrl.split('/');
  var protocol = pathArray[0];
  var host = pathArray[2];
  return protocol + '//' + host;
}
