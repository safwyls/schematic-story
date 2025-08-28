#!/bin/bash

echo "=== Checking available Sharp layers in your region ==="
REGION=$(aws configure get region)
echo "Current region: $REGION"

echo
echo "=== Official Sharp layers ==="
# Check a few common regions for Sharp layers
for region in us-east-1 us-east-2 us-west-1 us-west-2 eu-west-1; do
    echo "Checking $region:"
    aws lambda list-layers \
        --region $region \
        --query "Layers[?contains(LayerName, 'sharp')].{Name:LayerName,LatestVersion:LatestMatchingVersion.Version}" \
        --output table 2>/dev/null || echo "  No access or no layers found"
done

echo
echo "=== Your current Sharp layer ARN ==="
echo "From template: arn:aws:lambda:us-east-2:868651351479:layer:sharp:1"

echo
echo "=== Testing layer access ==="
aws lambda get-layer-version \
    --layer-name "arn:aws:lambda:us-east-2:868651351479:layer:sharp:1" \
    --version-number 1 \
    --region us-east-2 \
    --query '{Description:Description,CreatedDate:CreatedDate,CompatibleRuntimes:CompatibleRuntimes}' \
    --output table 2>/dev/null || echo "❌ Cannot access this layer"