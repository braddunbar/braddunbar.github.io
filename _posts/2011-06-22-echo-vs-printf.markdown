---
title: echo vs printf
layout: post
comments: true
tags: shell
---

Recently, I caused myself a giant headache because I was uninformed about echo
and how it differs from printf (not to mention how it affected my code).
Hopefully I can spare you the same pain. For the Software Tools Philosophy to
work, one must have a working knowledge of the tools.

Alright, review time. According to `man echo`, it's used to "display a line of
text". And so it does! It's quite handy when you need to dump something to
stdout. Especially when that something is literal text.

    $ echo cheese and crumpets
    cheese and crumpets

I often use `echo` for this reason, and normally it works in exactly the
fashion I expect. However, sometimes what I expect is not reasonable or even
logical! I tried to use `echo` to stitch together a screen stylesheet with a
print stylesheet. (I've heard that many browser's download print stylesheets
even when they're not using them. As such, it may as well come in a single http
request.) Specifically, I tried to do the following:

    echo -n "$(cat screen.css)\n@media print {\n$(cat print.css)\n}\n"

On the surface this looks like a perfectly reasonable approach and, given the
correct circumstances, it is. `echo` dutifully renders the print stylesheet
with a wrapping `@media` declaration. The problem is that the following was
included in `screen.css`:

    .clearfix:after, .container:after {
      content:"\0020"; ...
    }

You'll notice the unicode escape sequence for space (`\0200`). To `echo` this
looks like an escape sequence (and so it is, just not one we'd like to replace)
and so it replaces it. At this point I can hear you saying "But wait! echo has
the -E switch for that! It disables interpretation of backslash escape
sequences!". You're right. It does. It cannot, however, be used granularly.
This renders it useless for my task. I need to escape the newlines surrounding
the `@media` declaration, and yet I need to leave the unicode escapes in the
stylesheet untouched.

This is where `printf` saves the day. It works almost identically to
the version in `stdio.h`. It will _always_ replace backslash
escapes in the format string and _never_ replace backslash escapes in
arguments. In the end, I used the following command:

    printf "%s\n@media print {\n%s\n}\n" "$(cat screen.css)" "$(cat print.css)"

This worked like a charm and saved my day. \o/

Hopefully, you'll remember this next time you start echoing things with escape
sequences in them. I have no idea how quotes within the arguments are dealt
with but that's a mystery for another day.
