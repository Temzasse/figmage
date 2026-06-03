---
title: Figma API Access
description: Share the required credentials and file identifiers with developers securely.
---

Figmage uses the Figma REST API and needs both:

1. Personal access token
2. Figma file ID

## Access token

Generate a personal access token from your Figma account settings.

Share the token with developers through your secure secret-management flow, not in chat or design docs.

## File ID

Use the file URL to extract the file ID.

Example pattern:

`https://www.figma.com/file/<fileId>/...`

## Handoff contract

Provide:

1. Token delivery method
2. File ID
3. Expected token groups to sync
