---
title: Bitwise Not & indexOf
layout: post
comments: true
tags: javascript
---

Honestly, I've found precious few instances in which I need to use javascript's
[bitwise not][not] operator. However, I stumbled across a particularly nice
usage of it this morning as I was perusing the [express][express]
[source][express-source].

When I use [indexOf][indexof] to check for a substring I often feel the
statement is rather clumsy, especially if the variable name is particularly
long.

{% highlight javascript %}
if (someLongVariableName.indexOf(someSubstring) == -1) {
  // do stuff
}
{% endhighlight %}

The `== -1` part seems to get lost at the end of the expression and it takes me
an extra moment to parse the code. However, I found [this brilliant little nugget][nugget]
that makes it much easier to read.

{% highlight javascript %}
res.contentType = function(type){
  if (!~type.indexOf('.')) type = '.' + type;
  return this.header('Content-Type', mime.type(type));
};
{% endhighlight %}

Taking advantage of the fact that `~(-1) == 0` (and it is the only number with
this property), our statement becomes _truthy_ or _falsey_ and we can change
our previous example to

{% highlight javascript %}
if (!~someLongVariableName.indexOf(someSubstring)) {
  // do stuff
}
{% endhighlight %}

[not]: https://developer.mozilla.org/en/JavaScript/Reference/Operators/Bitwise_Operators#.7E_(Bitwise_NOT)
[express]: http://expressjs.com
[express-source]: http://github.com/visionmedia/express
[indexof]: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/indexOf
[nugget]: https://github.com/visionmedia/express/blob/dd8a0bd30f41122c9f54e3e82294a43f0e06ea43/lib/response.js#L206
