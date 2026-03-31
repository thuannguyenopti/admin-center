#!/bin/bash

# Fetch Coda documentation for Image Gen & Editing project
API_TOKEN="4eaa5f7a-be80-47a1-a5c9-98f882813020"
DOC_ID="0f_sY3MSh-"
OUTPUT_DIR="app/cmp/coda/Image-Gen-Editing"

mkdir -p "$OUTPUT_DIR"

# Fetch all pages related to Opal Epics
echo "Fetching all pages from Coda document..."
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "https://coda.io/apis/v1/docs/$DOC_ID/pages?limit=500" | \
  jq '.' > "$OUTPUT_DIR/all-pages.json"

# Fetch Q2 Epics & Features content
PAGE_ID="canvas-npgiTi7VqO"
echo "Fetching Q2 Epics & Features content..."

# Fetch first page of content
TOKEN=""
PAGE_NUM=0

while true; do
  PAGE_NUM=$((PAGE_NUM + 1))

  if [ -z "$TOKEN" ]; then
    URL="https://coda.io/apis/v1/docs/$DOC_ID/pages/$PAGE_ID/content"
  else
    URL="https://coda.io/apis/v1/docs/$DOC_ID/pages/$PAGE_ID/content?pageToken=$TOKEN"
  fi

  RESPONSE=$(curl -s -H "Authorization: Bearer $API_TOKEN" "$URL")
  echo "$RESPONSE" > "$OUTPUT_DIR/q2-epics-content-page-$PAGE_NUM.json"

  # Check if there's a next page
  TOKEN=$(echo "$RESPONSE" | jq -r '.nextPageToken // empty')
  [ -z "$TOKEN" ] && break

  echo "Fetched page $PAGE_NUM, continuing..."
done

echo "Content saved to $OUTPUT_DIR"
echo "Total pages fetched: $PAGE_NUM"
