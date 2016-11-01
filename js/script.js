var parser = {};
parser.getTaiwanNode = function() {
  // TODO(Dada): Make this case insensitive.
  return $('*:contains("Taiwan")');
};
parser.getText = function(node) {
  var lastNode = node.last();
  return lastNode[0].innerHTML;
};
parser.patterns = [
  // TODO(Dada): Need finer matching regex here.
  new RegExp('taiwan.*province.*of.*china'),
  new RegExp('taiwan.*prc'),
  new RegExp('taiwan.*china'),
  new RegExp('china.*taiwan')
];
parser.matchOffending = function(text) {
  var lower = text.toLowerCase();
  for (var x = 0; x < parser.patterns.length; ++x) {
    var re = parser.patterns[x];
    if (lower.match(re)) {
      return text;
    }
  }
  return false;
};
parser.getOffendingNode = function() {
  var taiwanNode = parser.getTaiwanNode();
  if (!taiwanNode) {
    return null;
  }
  if (parser.matchOffending(parser.getText(taiwanNode))) {
    return taiwanNode;
  }
  return null;
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
