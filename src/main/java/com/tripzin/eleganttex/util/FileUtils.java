package com.tripzin.eleganttex.util;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Utility class for file operations
 */
public class FileUtils {

    /**
     * Encode a file to Base64 string
     * 
     * @param file the file to encode
     * @return Base64 encoded string
     * @throws IOException if an I/O error occurs
     */
    public static String encodeFileToBase64(File file) throws IOException {
        return Base64.getEncoder().encodeToString(Files.readAllBytes(file.toPath()));
    }
    
    /**
     * Encode a file to Base64 string
     * 
     * @param filePath the path to the file
     * @return Base64 encoded string
     * @throws IOException if an I/O error occurs
     */
    public static String encodeFileToBase64(Path filePath) throws IOException {
        return Base64.getEncoder().encodeToString(Files.readAllBytes(filePath));
    }
    
    /**
     * Encode a file to Base64 string
     * 
     * @param filename the name of the resource file
     * @return Base64 encoded string
     * @throws IOException if an I/O error occurs
     */
    public static String encodeResourceFileToBase64(String filename) throws IOException {
        return Base64.getEncoder().encodeToString(loadResourceFile(filename));
    }

    /**
     * Load a resource file as byte array
     * 
     * @param filename the name of the resource file
     * @return byte array of the file content
     * @throws IOException if an I/O error occurs
     */
    private static byte[] loadResourceFile(String filename) throws IOException {
        ClassLoader classLoader = FileUtils.class.getClassLoader();
        InputStream inputStream = classLoader.getResourceAsStream(filename);
        if (inputStream == null) {
            throw new IOException("Resource not found: " + filename);
        }
        return inputStream.readAllBytes();
    }
}
