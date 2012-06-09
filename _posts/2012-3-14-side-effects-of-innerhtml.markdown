---
title: Side Effects of innerHTML
layout: post
comments: true
tags: javascript
---

Today I learned (after a long and arduous debugging session) that `innerHTML`
can have serious side effects when used in Internet Explorer.  Consider the following:

    var p = document.createElement('p');
    p.innerHTML = '<a>test</a>';
    a = p.childNodes[0];
    p.innerHTML = '';
    console.log(a.innerHTML);

Here's a [fiddle][fiddle] in case you want to play around with it.  In most
modern browsers this snippet will happily log `'test'` before continuing about
it's business.  Internet Explorer, on the other hand, will remove the contents
of `a` when setting `p.innerHTML` and log the empty string to the console.
Obviously this can lead to some interesting results if you're not expecting it.
Hopefully I've saved you the debugging time I've lost today.  ;)

I filed [a bug][bug] concerning this behavior on the jQuery issue tracker,
but it can't be fixed due to performance considerations (more details in
[the ticket][bug]).  However, a patch for this behavior is rather easy to
implement yourself.  I've been using the following in projects where this
causes issues:

    (function($) {

      // Feature test in order to avoid the performance
      // penalty in safe browsers.
      var safe = (function() {
        var p = $('<p><a> </a></p>');
        var a = p.find('a');
        p.html('');
        return !!a.html();
      })();

      if (safe) return;

      var html = $.fn.html;

      // Monkey patch $.fn.html
      $.fn.html = function(value) {
        return value === undefined ?
          html.apply(this, arguments) :
          this.empty().append(value);
      };

    })(jQuery);

[fiddle]: http://jsfiddle.net/Hej6h/6/
[bug]: http://bugs.jquery.com/ticket/11473
