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

var highlightText = function(){
  
  // add style to element
  this.style.textDecoration = "line-through";

  // add style to parent element
  var parent = this.parentElement;
  parent.style.cssText = 'border: 3;border-style: solid; border-color: #d11212; text-decoration: line-through;';


  // fade in fade out calling each other for ever
  var fadeOut = function(el){
    el.style.opacity = 1;

    (function fade() {
      if ((el.style.opacity -= .04) < 0) {
        fadeIn(el);
      } else {
        requestAnimationFrame(fade);
      }
    })();

  }

  var fadeIn = function(el){
    el.style.opacity = 0;

    (function fade() {
      var val = parseFloat(el.style.opacity);
      if (!((val += .04) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      }else{
        fadeOut(el);
      }
    })();
  }

  // start animation of fade in and fade out
  fadeOut(parent);

}


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

  var baseUrl = getBaseUrl(location.href);
  const cp = new ContactParser(baseUrl, $(document));
  var offendingNode = parser.getOffendingNode();
  if (offendingNode !== null) {
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
