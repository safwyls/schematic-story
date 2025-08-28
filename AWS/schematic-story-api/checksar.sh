#!/bin/bash

REGION=$(aws configure get region 2>/dev/null || echo "us-east-2")
APP_ID="arn:aws:serverlessrepo:us-east-1:987481058235:applications/nodejs-sharp-lambda-layer"

echo "Checking Sharp SAR application availability..."
echo "Region: $REGION"
echo "App ID: $APP_ID"
echo

# Check if the application exists and what versions are available
echo "=== Available versions ==="
aws serverlessrepo get-application \
    --application-id "$APP_ID" \
    --region us-east-1 \
    --query '{Name:Name,Description:Description,Author:Author,Versions:Version.SemanticVersion}' \
    --output table 2>/dev/null || {
    echo "Failed to get application info. Trying list-applications..."
    aws serverlessrepo list-applications \
        --region us-east-1 \
        --query "Applications[?contains(Name, 'sharp')]" \
        --output table
}

echo
echo "=== Checking specific version 0.34.1 ==="
aws serverlessrepo get-application \
    --application-id "$APP_ID" \
    --semantic-version "0.34.1" \
    --region us-east-1 \
    --query '{Name:Name,SemanticVersion:Version.SemanticVersion,CreationTime:CreationTime,RequiredCapabilities:Version.RequiredCapabilities}' \
    --output table 2>/dev/null || echo "Version 0.34.1 not found"

echo
echo "=== Alternative: Check latest version ==="
LATEST_VERSION=$(aws serverlessrepo get-application \
    --application-id "$APP_ID" \
    --region us-east-1 \
    --query 'Version.SemanticVersion' \
    --output text 2>/dev/null)

if [ ! -z "$LATEST_VERSION" ] && [ "$LATEST_VERSION" != "None" ]; then
    echo "Latest version: $LATEST_VERSION"
    echo "Try using this version instead of 0.34.1"
else
    echo "Could not determine latest version"
fi