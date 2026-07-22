# Expo Image Download & Save Guide (Cloudflare R2 URLs)

## Overview
This document provides step-by-step instructions and code snippets for frontend mobile developers (and AI assistants) to implement **image downloading** in an **Expo (React Native)** application using image URLs returned by the backend (which are hosted on **Cloudflare R2**).

---

## 1. Technical Clarification
- **Are Cloudflare R2 URLs downloadable?**  
  **Yes.** The public/presigned Cloudflare R2 URL returned by the backend API points directly to the image file stream.
- **How mobile app downloads work:**  
  Unlike web browsers with `<a download>`, mobile apps must stream the image bytes into the app's local document directory first using `expo-file-system`, and then either:
  1. Save the file directly to the device's **Photo Gallery / Camera Roll** (`expo-media-library`).
  2. Open the native **Share / Save to Files** dialog (`expo-sharing`).

---

## 2. Prerequisites & Dependencies

Run the following command in the Expo project to install required native modules:

```bash
npx expo install expo-file-system expo-media-library expo-sharing
```

---

## 3. Configuration (`app.json`)

To enable saving images to the user's photo gallery, configure the `expo-media-library` plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow this app to save product images to your photo gallery.",
          "saveToPhotosPermission": "Allow this app to save product images to your photo gallery."
        }
      ]
    ]
  }
}
```

---

## 4. Implementation Steps

1. **Request Permission:** Request media library access using `MediaLibrary.requestPermissionsAsync()`.
2. **Download File to Cache/Docs:** Download raw bytes from the Cloudflare R2 URL using `FileSystem.downloadAsync(r2Url, localUri)`.
3. **Save to Gallery:** Move the downloaded file into the device photo library using `MediaLibrary.saveToLibraryAsync(localUri)`.
4. **(Optional) Native Share:** Use `Sharing.shareAsync(localUri)` if the user prefers saving to iCloud Files / Google Drive / WhatsApp.

---

## 5. Ready-to-Use React Native Component

Below is a complete, copy-paste ready TypeScript component:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface ImageDownloaderProps {
  imageUrl: string; // The Cloudflare R2 URL returned by the API response
}

export const ImageDownloader: React.FC<ImageDownloaderProps> = ({ imageUrl }) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  /**
   * Option A: Save image directly to device Photo Gallery / Camera Roll
   */
  const handleDownloadToGallery = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Image URL is missing.');
      return;
    }

    try {
      setDownloading(true);

      // Step 1: Request Media Library Permissions
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Denied',
          'Permission to access photo gallery is required to download images.'
        );
        setDownloading(false);
        return;
      }

      // Step 2: Generate local filename and path
      const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `download_${Date.now()}.${fileExtension}`;
      const localFileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Step 3: Stream download from Cloudflare R2 URL to app's local storage
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localFileUri);

      if (downloadResult.status === 200) {
        // Step 4: Save downloaded local file to Media Library / Gallery
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert('Success', 'Image saved to your photo gallery!');
      } else {
        Alert.alert('Download Error', 'Server returned error status during download.');
      }
    } catch (error) {
      console.error('Failed to download image:', error);
      Alert.alert('Download Error', 'Could not download the image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Option B: Open native Share / Save to Files modal
   */
  const handleDownloadAndShare = async () => {
    if (!imageUrl) return;

    try {
      setDownloading(true);

      const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `download_${Date.now()}.${fileExtension}`;
      const localFileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, localFileUri);

      if (downloadResult.status === 200) {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Sharing Unavailable', 'Native sharing is not supported on this device.');
        }
      }
    } catch (error) {
      console.error('Failed to share image:', error);
      Alert.alert('Error', 'An error occurred while sharing the image.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />

      {downloading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleDownloadToGallery}>
            <Text style={styles.primaryButtonText}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleDownloadAndShare}>
            <Text style={styles.secondaryButtonText}>Save to Files / Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});
```

---

## 6. Summary for AI / Developers
1. Cloudflare R2 links work out of the box for direct binary file downloads.
2. Use `FileSystem.downloadAsync` to stream the image from Cloudflare R2 into Expo storage.
3. Use `MediaLibrary.saveToLibraryAsync` to store the image in the phone gallery.
4. Ensure permissions are declared in `app.json` for iOS and Android.
