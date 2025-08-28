#!/bin/bash

set -e

echo "Creating Sharp layer using Node.js 22 container..."

# Clean up
rm -rf layers/sharp-layer

# Create directory structure
mkdir -p layers/sharp-layer/nodejs

# Create package.json
cat > layers/sharp-layer/nodejs/package.json << 'EOF'
{
  "name": "sharp-layer",
  "version": "1.0.0",
  "dependencies": {
    "sharp": "0.33.5"
  }
}
EOF

echo "Installing Sharp using Node.js 22 container..."

# Use official Node.js 22 image and force linux/amd64 platform
docker run --rm \
  --platform linux/amd64 \
  -v "$(pwd)/layers/sharp-layer/nodejs":/app \
  -w /app \
  node:22-slim \
  bash -c "
    echo 'Node version:' && node --version
    echo 'Installing Sharp for Linux x64...'
    npm config set target_platform linux
    npm config set target_arch x64
    npm install --verbose
    echo 'Installation complete. Checking Sharp:'
    ls -la node_modules/sharp/
    echo 'Checking for native binaries:'
    find node_modules/sharp -name '*.node' -o -name '*.so*' | head -10
    echo 'Final directory size:'
    du -sh .
  "

# Verify the installation
if [ -d "layers/sharp-layer/nodejs/node_modules/sharp" ]; then
    echo "Sharp layer created successfully!"
    echo "Final layer size: $(du -sh layers/sharp-layer)"
    
    # Quick verification
    NATIVE_FILES=$(find layers/sharp-layer/nodejs/node_modules/sharp -name "*.node" -o -name "*.so*" | wc -l)
    if [ $NATIVE_FILES -gt 0 ]; then
        echo "Native binaries found: $NATIVE_FILES files"
        echo "Layer should work in Lambda!"
    else
        echo "Warning: No native binaries found. This may not work in Lambda."
    fi
else
    echo "Sharp installation failed!"
    exit 1
fi

echo ""
echo "To use this layer, add to your template.yaml:"
echo ""
echo "  SharpLayer:"
echo "    Type: AWS::Serverless::LayerVersion"
echo "    Properties:"
echo "      LayerName: sharp-layer"
echo "      ContentUri: layers/sharp-layer/"
echo "      CompatibleRuntimes:"
echo "        - nodejs22.x"
echo "      CompatibleArchitectures:"
echo "        - x86_64"