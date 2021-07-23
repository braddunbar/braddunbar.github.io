---
title: "Redis: Scan I help you?"
layout: post
published: false
---

<style>

.insert-form {
  display: inline-block;
  margin-left: 4px;
}

.buckets {
  border: solid 1px #ccc;
  border-bottom: none;
  border-radius: 3px;
  font-family: monospace;
  margin-top: 4px;
}

.bucket {
  border-bottom: solid 1px #ccc;
  padding: 4px;
}

.bucket-checked {
  background: palegreen;
}

.bucket-value {
  cursor: pointer;
}

.bucket-value::before {
  content: ' → ';
}

</style>

<div id='root'></div>

<script type='module' src='/scripts/scan.js'></script>
