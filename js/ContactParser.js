/**
 * Created by acsalu on 11/5/16.
 */
const patterns = {
  mailto: 'a[href^="mailto:"]',
  contact: 'a:contains("Contact")'
}

class ContactParser {
  constructor(baseUrl, $document) {
    this.baseUrl = baseUrl;
    this.$document = $document;

    const $iframe = $('<iframe/>', {
      id: 'contact-parser-frame',
      style: 'display: none'
    });
    $('body').append($iframe);

    this.$iframe = $iframe;
  }

  findMailAddresses(callback) {
    var mailAddresses = ContactParser._parseMailAddresses(this.$document);
    if (mailAddresses.length > 0) {
      console.log('found contact on this page');
      callback(mailAddresses);
      return;
    }
    var contactUrl = ContactParser._parseContactUrl(
        $($.get({url: this.baseUrl, async: false}).responseText));
    if (contactUrl) {
      contactUrl = this.baseUrl + '/' + contactUrl;
      console.log(contactUrl);
      this.$iframe.on('load', function() {
        console.log('iframe loaded');
        mailAddresses = ContactParser._parseMailAddresses($(this).contents());
        console.log(mailAddresses.length);
        callback(mailAddresses);
        return;
      });
      this.$iframe.attr('src', contactUrl);
    }
  }

  static _parseMailAddresses($ele) {
    return this._parse($ele, patterns.mailto).map((i, e) => {return e.href});
  }

  static _parseContactUrl($ele) {
    var contacts = this._parse($ele, patterns.contact);
    if (contacts.length === 0) {
      return null;
    }
    return $(contacts[0]).attr('href');
  }

  static _parse($ele, ptrn) {
    return $ele.find(ptrn);
  }
}

