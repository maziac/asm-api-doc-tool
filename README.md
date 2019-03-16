# Documentation Tool for sjasmplus

This simple documentation tool takes the comments above labels, extracts them and generates a html output which is easy to navigate.
You can decide what sub routines will be documented. Only labels which are marked with EXPORT are extracted.

If you need a tool to create the documentation for your library you might find this tool helpful.
All the internal (in C++ this would be private) labels will not occur only the ones you select, i.e. only the "public" ones.


## Features

- supports sjasmplus syntax (sjasmplus v1.11.0)
- uses sjasmplus EXPORT definition to select the labels to document
- creates documentation from comments inside the source code
- reads in the list file (sjasmplus output)


## Installation

The program is written in typescript and can be built for Linux, Mac or Windows.

If you don't want to build you can use the prebuilt binaries from the releases.

Just unzip and run.


## Usage

First you need to create a list file with sjasmplus

~~~
sjasmplus --lst=main.list main.asm
~~~

~~~
sjasmplus --lst=main.list main.asm exports.asm
~~~


