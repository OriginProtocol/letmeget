#!/bin/bash

DEST_ZIP="$1"
THIS_DIR="$(dirname "$0")"
PWD="$(pwd)"
WORK_DIR="/tmp/lambda-function-$(date +%Y%m%d%H%M%S)"

if [[ -z "$DEST_ZIP" ]]; then
    echo "Need a filename"
    exit 1
fi

# Create workdir
mkdir -p $WORK_DIR &&

# Copy function
cp $THIS_DIR/lambda_function.py $WORK_DIR/ &&

# Install deps
pip install --target $WORK_DIR/ -r $THIS_DIR/requirements.txt &&

# Switch to work dir so it's zip root
cd $WORK_DIR &&

# Zip it up
zip -r $DEST_ZIP * &&

# Go back to where we started
cd $PWD
