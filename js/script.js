var parser = {};
// Return the node containing the DOM path leading to the html object containing
// offending pattern e.g. Taiwan, Province of China.
parser.getOffendingNode = function() {
  return parser.traverse_(document);
};

// Private methods.
parser.traverse_ = function(node) {
  var text = node.text || node.textContent;
  if (text) {
    if (node.tagName != 'TITLE' &&
        node.tagName != 'SCRIPT' &&
        parser.matchOffending_(text)) {
      return node;
    }
  }
  for (var x = 0; x < node.children.length; ++x) {
    var child = parser.traverse_(node.children[x]);
    if (child) {
      return child;
    }
  }
  return null;
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
  if (offendingNode) {
    highlightText.call(offendingNode);
    alert('offending');
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
