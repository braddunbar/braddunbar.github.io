---
layout: post
---

It has come to my attention that perhaps [Underscore templates][docs] are a bit
misunderstood.  Or, perhaps, the community is simply unaware of their best
features and usage.  Either way, I'd like to provide a primer for the
uninitiated and a knowledge base for the rest.  The goals and benefits of
client side templating have been [explored fairly thoroughly][js-templates] so
I'll jump right into the good stuff.

There are lots of code examples below, so make sure to play around with anything
you don't understand.  Just head over to [underscorejs.org](http://underscorejs.org)
and open up the console.

### Basics

Based loosely on [John Resig's micro-templating][micro-templating], Underscore
templates should have a fairly familiar feel.  Put in some text with delimeters
for your data, and `_.template` does the substitution for you, easy peasy.

{% highlight javascript %}
_.template('<p><%= text %></p>', {text: 'o hai!'});
// <p>o hai!</p>
{% endhighlight %}

The syntax is flexible so don't rage quit if you dislike `<%= %>`.  You can
just use different delimiters.  Need to HTML escape your data?  No problem,
just use `<%- %>`.

{% highlight javascript %}
_.template('<%- text %>', {text: '1 < 2'});
// 1 &lt; 2
{% endhighlight %}

Underscore templates also happen to be *logical* (as opposed to logic-less),
allowing you to use whatever crazy javascript you can come up with.  I happen
to enjoy this sort of freedom but if it's not your cup of tea, don't sweat it.

{% highlight javascript %}
_.template('<% _.times(5, function(i){ %><%- i %><% }); %>', {});
// 012345
{% endhighlight %}

### Custom Delimeters

If you'd prefer a different set of delimeters, you can easily provide your own
regular expressions for interpolating, escaping, and evaluating.  Each regular
expression must provide exactly one capturing group.

{% highlight javascript %}
{% raw %}
_.template('{{ wave }}', {wave: 'o/'}, {
  interpolate: /\{\{([\s\S]+?)\}\}/g
});
// o/
{% endraw %}
{% endhighlight %}

These options can also be set globally via `_.templateSettings`.

### Compilation

If you leave out the data argument, you are returned a plain old function that
you can execute many times over without the overhead of compilation.

{% highlight javascript %}
var template = _.template('<p><%- text %></p>');
template({text: 'foo'}); // <p>foo</p>
template({text: 'bar'}); // <p>bar</p>
{% endhighlight %}

You can inspect the template source via the `source` property, which is handy
for precompiling your templates.  It's crazy fast compared to compiling on each
load and, more importantly, it provides useful line/column numbers in stack
traces.

{% highlight javascript %}
_.template('<p><%- text %></p>').source;
// function(obj){
// var __t,__p='',__j=Array.prototype.join,
// print=function(){__p+=__j.call(arguments,'');};
// with(obj||{}){
// __p+='<p>'+
// ((__t=( text ))==null?'':_.escape(__t))+
// '</p>';
// }
// return __p;
// }
{% endhighlight %}

While it might seem a bit esoteric, viewing the template source is rather
instructive.  First and foremost, it proves that templates are just javascript,
no magic involved.  Secondly, it provides for some interesting techniques.

### Slow by Default

Since version 1.3.3, underscore templates have been [quite fast][benchmark].
However, backward compatibility concerns force them to be slow by default.  By
specifying a `variable` to prefix your data with, you can speed things up by an
order of magnitude.

{% highlight javascript %}
_.template('<%- data.x %>', null, {variable: 'data'});
{% endhighlight %}

When a `variable` is not specified, the template source is wrapped in a `with`
statement.  While there are plenty of [existing
implications][with-considered-harmful] regarding the `with` statement, we're
only concerned with performance here and the `with` statement makes things
*much* slower.

### Template Context

While, in my experience, under-used, a template is always provided with a
context, which can be quite useful when rendering your views.  This prevents
the need to pass a custom data argument to your template, sparing you from
memorizing yet another application custom API, not to mention creating another
custom API at all.  This is maybe my favorite `_.template` technique but
has gone unnoticed by most.

{% highlight javascript %}
var view = {
  x: 7,
  template: _.template('<b><%- this.x %></b>')
};
view.template();
// <b>7</b>
{% endhighlight %}

I find it particularly useful in [Backbone views][backbone-view] but it's
equally useful when rolling your own.

{% highlight javascript %}
var View = Backbone.View.extend({

  template: _.template(' \
    <h1><%- this.model.get("title") %></h1> \
    <ul><% this.collection.each(function(model) { %> \
      <li><%- model.get("name") %></li> \
    <% }, this); %></ul> \
  '),

  render: function() {
    this.$el.html(this.template());
    return this;
  }

});
{% endhighlight %}

### Further Reading

This post actually turned out relatively small, which I think is a testament to
the simplicity of `_.template`.  If you want to dig deeper I'd suggest reading
[the source][underscorejs], as there really is no substitute.  :)

[underscorejs]: http://underscorejs.org/underscore.js
[backbone-view]: http://backbonejs.org#View
[with-considered-harmful]: http://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/
[escape]: http://underscorejs.org/#escape
[docs]: http://underscorejs.org/#template
[micro-templating]: http://ejohn.org/blog/javascript-micro-templating/
[js-templates]: http://www.garann.com/dev/2012/using-javascript-templates/
[benchmark]: http://jsperf.com/underscore-template-function-with-variable-setting
