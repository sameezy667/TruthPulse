/**
 * Capacitor plugin for native Android Tesseract OCR
 * 
 * This plugin provides on-device OCR using tess-two library (Tesseract wrapper for Android).
 * 
 * Dependencies:
 * - tess-two (Maven: com.rmtheis:tess-two:9.0.0)
 * - Tesseract trained data files (tessdata/eng.traineddata in assets)
 * 
 * Usage from JavaScript:
 * ```typescript
 * import { Capacitor } from '@capacitor/core';
 * const { TesseractPlugin } = Capacitor.Plugins;
 * const result = await TesseractPlugin.recognizeImage({ imageData: base64String });
 * console.log(result.text, result.confidence);
 * ```
 */

package com.truthpulse.plugins

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.googlecode.tesseract.android.TessBaseAPI
import java.io.File
import java.io.FileOutputStream

/**
 * Capacitor plugin for Tesseract OCR on Android
 */
@CapacitorPlugin(name = "TesseractPlugin")
class TesseractPlugin : Plugin() {

    companion object {
        private const val TAG = "TesseractPlugin"
        private const val TESSDATA_FOLDER = "tessdata"
        private const val LANGUAGE = "eng"
    }

    private var tessBaseAPI: TessBaseAPI? = null
    private var isInitialized = false

    /**
     * Initialize Tesseract engine
     * Called automatically on first use or manually via initializeOCR()
     */
    private fun initializeTesseract(): Boolean {
        if (isInitialized) {
            return true
        }

        try {
            // Get the data path for tessdata
            val dataPath = context.filesDir.absolutePath + "/"
            val tessDataPath = File(dataPath, TESSDATA_FOLDER)

            // Create tessdata directory if it doesn't exist
            if (!tessDataPath.exists()) {
                tessDataPath.mkdirs()
            }

            // Copy trained data from assets if not already present
            val trainedDataFile = File(tessDataPath, "$LANGUAGE.traineddata")
            if (!trainedDataFile.exists()) {
                Log.d(TAG, "Copying tessdata from assets...")
                copyAssetFile("$TESSDATA_FOLDER/$LANGUAGE.traineddata", trainedDataFile)
            }

            // Initialize TessBaseAPI
            tessBaseAPI = TessBaseAPI()
            val initSuccess = tessBaseAPI?.init(dataPath, LANGUAGE) ?: false

            if (!initSuccess) {
                Log.e(TAG, "Tesseract initialization failed")
                return false
            }

            isInitialized = true
            Log.d(TAG, "Tesseract initialized successfully")
            return true

        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Tesseract", e)
            return false
        }
    }

    /**
     * Copy asset file to internal storage
     */
    private fun copyAssetFile(assetPath: String, destFile: File) {
        try {
            context.assets.open(assetPath).use { inputStream ->
                FileOutputStream(destFile).use { outputStream ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        outputStream.write(buffer, 0, bytesRead)
                    }
                }
            }
            Log.d(TAG, "Asset copied successfully: $assetPath")
        } catch (e: Exception) {
            Log.e(TAG, "Error copying asset: $assetPath", e)
            throw e
        }
    }

    /**
     * Recognize text from base64 encoded image
     * 
     * @param call - Capacitor plugin call with imageData parameter
     * @returns JSON object with { text: string, confidence: number }
     */
    @PluginMethod
    fun recognizeImage(call: PluginCall) {
        try {
            // Get image data from call
            val imageData = call.getString("imageData")
            if (imageData == null || imageData.isEmpty()) {
                call.reject("Image data is required")
                return
            }

            // Initialize Tesseract if needed
            if (!initializeTesseract()) {
                call.reject("Failed to initialize Tesseract OCR engine")
                return
            }

            // Decode base64 to Bitmap
            val bitmap = decodeBase64ToBitmap(imageData)
            if (bitmap == null) {
                call.reject("Failed to decode image data")
                return
            }

            // Perform OCR
            tessBaseAPI?.setImage(bitmap)
            val recognizedText = tessBaseAPI?.utF8Text ?: ""
            val confidence = tessBaseAPI?.meanConfidence() ?: 0

            // Clean up
            bitmap.recycle()

            // Return result
            val result = com.getcapacitor.JSObject()
            result.put("text", recognizedText)
            result.put("confidence", confidence.toFloat())

            Log.d(TAG, "OCR completed: ${recognizedText.length} chars, ${confidence}% confidence")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "Error during OCR recognition", e)
            call.reject("OCR recognition failed: ${e.message}", e)
        }
    }

    /**
     * Decode base64 string to Bitmap
     */
    private fun decodeBase64ToBitmap(base64String: String): Bitmap? {
        return try {
            // Remove data URI scheme if present (e.g., "data:image/png;base64,")
            val cleanBase64 = base64String.replace("data:image/[^;]+;base64,".toRegex(), "")
            
            val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
        } catch (e: Exception) {
            Log.e(TAG, "Error decoding base64 to bitmap", e)
            null
        }
    }

    /**
     * Clean up resources when plugin is destroyed
     */
    override fun handleOnDestroy() {
        super.handleOnDestroy()
        tessBaseAPI?.end()
        tessBaseAPI = null
        isInitialized = false
        Log.d(TAG, "Tesseract resources released")
    }

    /**
     * Optional: Manual initialization method
     * (Auto-init happens on first recognizeImage call)
     */
    @PluginMethod
    fun initializeOCR(call: PluginCall) {
        val success = initializeTesseract()
        if (success) {
            call.resolve()
        } else {
            call.reject("Failed to initialize OCR engine")
        }
    }
}
