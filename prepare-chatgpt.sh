#!/bin/bash

# Set source and output file
SOURCE_DIR="src"
OUTPUT_DIR="$HOME/Downloads/chatgpt"
OUTPUT_FILE="$OUTPUT_DIR/waha.ts"

# Create or clear the output file
rm -f "$OUTPUT_FILE"
touch "$OUTPUT_FILE"

# Find all .md files in the source directory and combine them
find "$SOURCE_DIR" -type f -name "*.ts" | while read -r file; do
  # Add file name  to OUTPUT_FILE
  echo "\n-------" >> "$OUTPUT_FILE"
  echo "File: $file" >> "$OUTPUT_FILE"
  echo "-------\n" >> "$OUTPUT_FILE"
  # Append the content of the file to the output file
  cat "$file" >> "$OUTPUT_FILE"
done

echo "All .ts files combined into $OUTPUT_FILE with separators."
