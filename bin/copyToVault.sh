#!/bin/bash

PLUGIN_NAME="obsidian-google-lookup"
PLUGIN_DIR="$OBSIDIAN_VAULT/.obsidian/plugins/$PLUGIN_NAME"

[ ! -d $PLUGIN_DIR ] && echo "directory in OBSIDIAN_VAULT is invalid" && exit 1

echo "copying to $PLUGIN_DIR/"
cp dist/* $PLUGIN_DIR/
