import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';

export const testSharp = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('=== Sharp Test Started ===');
    
    const testResults = {
        timestamp: new Date().toISOString(),
        environment: {
            runtime: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
            NODE_PATH: process.env.NODE_PATH,
            LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT
        },
        moduleResolution: {} as any,
        sharpTest: {} as any,
        filesystem: {} as Record<string, any>
    };
    
    try {
        // 1. Check module resolution paths
        console.log('Checking module resolution paths...');
        testResults.moduleResolution = {
            sharpPaths: require.resolve.paths('sharp'),
            requireCache: Object.keys(require.cache).filter(key => key.includes('sharp'))
        };
        
        // 2. Check filesystem for Sharp
        console.log('Checking filesystem for Sharp...');
        const checkPaths = [
            '/var/task/node_modules/sharp',
            '/opt/nodejs/node_modules/sharp', 
            '/opt/node_modules/sharp',
            '/opt/sharp'
        ];
        
        for (const checkPath of checkPaths) {
            try {
                if (fs.existsSync(checkPath)) {
                    const stats = fs.statSync(checkPath);
                    testResults.filesystem[checkPath] = {
                        exists: true,
                        isDirectory: stats.isDirectory(),
                        size: stats.size
                    };
                    
                    if (stats.isDirectory()) {
                        testResults.filesystem[checkPath].contents = fs.readdirSync(checkPath).slice(0, 5);
                    }
                } else {
                    testResults.filesystem[checkPath] = { exists: false };
                }
            } catch (error) {
                testResults.filesystem[checkPath] = { 
                    error: error instanceof Error ? error.message : String(error) 
                };
            }
        }
        
        // 3. Try to require Sharp
        console.log('Attempting to load Sharp...');
        const sharp = require('sharp');
        console.log('Sharp loaded successfully!');
        
        testResults.sharpTest.loaded = {
            success: true,
            version: sharp.versions,
            resolvedPath: require.resolve('sharp'),
            libvipsVersion: sharp.versions?.vips || 'unknown',
            sharpVersion: sharp.versions?.sharp || 'unknown'
        };
        
        // 4. Test basic Sharp functionality
        console.log('Testing Sharp image creation...');
        const testImage = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        }).png().toBuffer();
        
        testResults.sharpTest.imageCreation = {
            success: true,
            bufferSize: testImage.length,
            bufferType: typeof testImage
        };
        console.log('Image creation test passed!');
        
        // 5. Test Sharp image processing
        console.log('Testing Sharp image processing...');
        const processedImage = await sharp(testImage)
            .resize(50, 50)
            .greyscale()
            .png()
            .toBuffer();
        
        testResults.sharpTest.imageProcessing = {
            success: true,
            originalSize: testImage.length,
            processedSize: processedImage.length,
            sizeDifference: processedImage.length - testImage.length
        };
        console.log('Image processing test passed!');
        
        // 6. Test Sharp metadata
        console.log('Testing Sharp metadata...');
        const metadata = await sharp(testImage).metadata();
        
        testResults.sharpTest.metadata = {
            success: true,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            channels: metadata.channels
        };
        console.log('Metadata test passed!');
        
        console.log('=== All Sharp tests passed! ===');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: '🎉 Sharp is working perfectly!',
                tests: testResults
            }, null, 2)
        };
        
    } catch (error: any) {
        console.error('Sharp test failed:', error);
        
        testResults.sharpTest.error = {
            message: error.message,
            stack: error.stack,
            code: error.code
        };
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message: '❌ Sharp test failed',
                error: error.message,
                tests: testResults
            }, null, 2)
        };
    }
};

// Test function specifically for image processing
export const testImageProcessing = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const sharp = require('sharp');
        
        // Create test images of different formats
        const tests: any[] = [];
        
        // Test 1: PNG creation and processing
        const pngBuffer = await sharp({
            create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } }
        }).png().toBuffer();
        
        const pngThumbnail = await sharp(pngBuffer).resize(50, 50).png().toBuffer();
        tests.push({ format: 'PNG', original: pngBuffer.length, thumbnail: pngThumbnail.length });
        
        // Test 2: JPEG creation and processing
        const jpegBuffer = await sharp({
            create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 255, b: 0 } }
        }).jpeg({ quality: 80 }).toBuffer();
        
        const jpegThumbnail = await sharp(jpegBuffer).resize(50, 50).jpeg({ quality: 60 }).toBuffer();
        tests.push({ format: 'JPEG', original: jpegBuffer.length, thumbnail: jpegThumbnail.length });
        
        // Test 3: WebP creation (if supported)
        try {
            const webpBuffer = await sharp({
                create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 0, b: 255 } }
            }).webp({ quality: 80 }).toBuffer();
            
            tests.push({ format: 'WebP', original: webpBuffer.length, supported: true });
        } catch (webpError: any) {
            tests.push({ format: 'WebP', supported: false, error: webpError.message });
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Image processing tests completed',
                sharpVersion: sharp.versions,
                tests: tests
            }, null, 2)
        };
        
    } catch (error: any) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            }, null, 2)
        };
    }
};