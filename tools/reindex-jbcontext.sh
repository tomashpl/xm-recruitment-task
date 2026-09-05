#!/bin/sh
# Keeps the local semantic-search index in step with HEAD.
# Optional by design: the index is a developer convenience, so a machine
# without jbcontext installed must not fail anyone's commit or merge.

command -v jbcontext >/dev/null 2>&1 || exit 0

jbcontext index --silent >/dev/null 2>&1 &
