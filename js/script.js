$(function() {

  var baseUrl = getBaseUrl(location.href);
  const cp = new ContactParser(baseUrl, $(document));

  cp.findMailAddresses(function(mailAddresses) {
    for (var i = 0; i < mailAddresses.length; ++i) {
      console.log(mailAddresses[i]);
    }
  });
});

function getBaseUrl(origUrl) {
    var pathArray = origUrl.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}
