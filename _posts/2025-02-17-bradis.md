---
layout: default
title: Bradis
layout: post
---

A few years ago, I needed a project. I had become consumed by a desire to use
[Rust][rust], and I was trying to learn how to do complex things with it. Small
projects and challenges were getting old and I felt like I was spinning my
wheels. I needed something I was uncomfortable with.

After some failed attempts at contributing to the language or projects around
it, I had an idea. I was talking with a friend about [Redis][redis], which also
consumes a lot of my brain cycles, and I thought "I should make a Redis".

Yes. I know. There is already a Redis. It works much better than the one I
could write. It's more stable and has more support. This won't be something to
*use* per se, but rather a tool to focus my efforts. That's ok!

So my Redis probably wouldn't be good or complete, but I was determined to make
a serious attempt at it. I wanted to write something with production in mind,
even if it never lives in production.

Anyways. I started to write Redis with Rust, and several years later I have
something that is decidedly not a Redis. It's a small piece of a Redis, which
is not particularly valuable given the existence of a full,
free<sup>[1](#free-ish)</sup> Redis.

*However!*

It also happens to contain all the things I've learned in the meantime. It
contains my reintroduction to the stack and the heap after many years of
dynamic languages. It represents my struggles with the borrow checker and my
best attempts at writing <code>unsafe</code> code. It's everything I know about
async Rust. It's an outline of how Redis works. It's an illustration of how to
do zero-copy networking. It's my conception of atomic operations and
concurrency. And it's the absurb amount of fun I had putting it together.

And that's pretty valuable - at least to me. And maybe someone else…?

I've gone a long way on my own but I think I want more now. I'd like to share
it with someone. Get some feedback. Ask for help. Compare it to other people's
understanding. Multiply the fun. Divide the despair.

I've been calling it Bradis, because it sounds like Redis. And I like the way
it declares my existence. Brad is. (I am.)

### WASM

One of my favorite things about Rust is its support for compiling to [web
assembly][wasm]. With a bit of work and a few
caveats<sup>[2](#wasm-caveats)</sup>, you can run Rust code in the browser. The
repl below is Bradis running in the browser via WASM. Try out some Redis
commands!

<script type="module" src="/js/repl.js"></script>

* `set x foo` - set a value
* `get x` - get a value
* `command list` - get a list of commands
* `hset h x 1` - set values in a hash
* `rpush l a b c` - push values into a list
* `sadd s x y z` - push values into a set
* `zadd z 1 x 2 y 3 z` - add values to a sorted set
* `multi` - start a transaction
* `exec` - execute a transaction
* `client info` - get info about the current client

<div id="repl-one"></div>

Also, try some commands that use two clients.

* `subscribe news` - subscribe to a channel above
* `publish news boom` - publish to a channel below
* `blpop l 0` - block while waiting for a value above
* `rpush l a b c` - add a value for the command above

<div id="repl-two"></div>

### Performance

One of my main goals was to create something that is reasonably competitive
with C-Redis from a latency and throughput standpoint. According to
`redis-benchmark`, C-Redis is 1.7 times as fast as Bradis. I have some ideas
for closing that gap, but I'm pretty happy to be in the same order of
magnitude. 100k requests per second is pretty fast!

Bradis:

```
~: redis-benchmark -t set -n 1000000 -c 20 -p 3333
====== SET ======
  1000000 requests completed in 9.57 seconds
  20 parallel clients
  3 bytes payload
…
Summary:
  throughput summary: 104471.38 requests per second
  latency summary (msec):
          avg       min       p50       p95       p99       max
        0.109     0.040     0.111     0.127     0.143     0.591
```

C-Redis:

```
~: redis-benchmark -t set -n 1000000 -c 20
====== SET ======
  1000000 requests completed in 5.73 seconds
  20 parallel clients
  3 bytes payload
…
Summary:
  throughput summary: 174581.00 requests per second
  latency summary (msec):
          avg       min       p50       p95       p99       max
        0.067     0.024     0.063     0.119     0.175     1.799
```

### Repos

Currently, Bradis exists as four repos. If you're curious about what's
implemented and what isn't, this is the place to start!

* [respite][respite] - An implementation of the [RESP protocol][resp]
* [bradis][bradis] - This is where everything else lives - commands, store, db,
  etc.
* [bradis-server][bradis-server] - A server that listens for connections over
  TCP.
* [bradis-web][bradis-web] - A WASM build for running in the browser

### That's it

That's all I've got for now. I'll be writing down all the things I've learned
here. If you like them, or you don't like them, or they're wrong, or you have
questions, <a href="https://hachyderm.io/@braddunbar" target="_blank">let me
know</a>!

<hr>

<span id="free-ish">1.</span> [License changes][license] notwithstanding.

<span id="wasm-caveats">2.</span> There are a few capabilities that aren't
currently supported in the browser (e.g. threads) so they have to be emulated
or left out.

[license]: https://redis.io/blog/redis-adopts-dual-source-available-licensing/
[redis]: https://redis.io
[respite]: https://github.com/braddunbar/respite
[resp]: https://redis.io/docs/latest/develop/reference/protocol-spec/
[rust]: https://www.rust-lang.org/
[wasm]: https://webassembly.org/
[tokio]: https://tokio.rs/
[bradis]: https://github.com/braddunbar/bradis
[bradis-server]: https://github.com/braddunbar/bradis-server
[bradis-web]: https://github.com/braddunbar/bradis-web
