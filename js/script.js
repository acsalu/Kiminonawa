var parser = {};
// Return a list containing the DOM path leading to the html object containing
// the phrase 'Taiwan'.
parser.getOffendingNode = function() {
  var taiwanNode = parser.getTaiwanNode_();
  if (taiwanNode.length == 0) {
    return null;
  }
  if (parser.matchOffending_(parser.getText_(taiwanNode))) {
    return taiwanNode;
  }
  return null;
};

// Private methods.
parser.getTaiwanNode_ = function() {
  var node = $('*:contains("Taiwan")');
  if (node) {
    return node;
  }
  return $('*:contains("taiwan")');
};
parser.getText_ = function(node) {
  var lastNode = node.last();
  return lastNode[0].innerHTML;
};
parser.patterns_ = [
  new RegExp('taiwan\\s*,?\\s*province\\s*of\\s*china', 'i'),
  new RegExp('taiwan\\s*,?\\s*prc', 'i'),
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

$(function() {
  // Can access page DOM here
  var offendingNode = parser.getOffendingNode();
  var baseUrl = getBaseUrl(location.href);
});

function getBaseUrl(origUrl) {
    var pathArray = origUrl.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}
