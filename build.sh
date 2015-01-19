#!/bin/sh

workpath=$(cd `dirname $0`; pwd)/
find src/core -name "*.ts" >> files.txt
tsc -d @files.txt --out dist/DragonBones.js -t ES5
rm files.txt