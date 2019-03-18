# API Documentation Tool for sjasmplus

Note: The tool is not yet usable. Please wait a little bit...

This simple documentation tool for assembler files takes the comments above labels, extracts them and generates a html output which is easy to navigate.
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

First you need to create a list file with sjasmplus from your sources. Something list this (main.asm and main.list are just exaemplanatory fiel names):

~~~
sjasmplus --lst=main.list main.asm
~~~

Make sure that your main.asm contains EXPORT statements.
Only labels with EXPORT statements will be documented.

Alternatively you can also put all EXPORT statements in a single file (e.g. exprots.asm) and add that to the sjasmplus command line.

~~~
sjasmplus --lst=main.list main.asm exports.asm
~~~

Once you generated the list file you can use it as input to the doc tool.

~~~
sjasmplus-doc-tool main.list doc_directory
~~~

The command above will take the list file (main.list) and create a directory 'doc_directory'.
Then it writes the documentation html files into the directory.

To see the html documentation simply point your browser to 'doc_directory/index.html'.


