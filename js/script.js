$(function() {
	// Can access page DOM here
    var baseUrl = getBaseUrl(location.href);
});

function getBaseUrl(origUrl) {
    var pathArray = origUrl.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}
