import RNFS from "react-native-fs";

export const clearCacheTwo = async () => {
  "worklet";
  const cacheDir = RNFS.CachesDirectoryPath;
  try {
    const files = await RNFS.readDir(cacheDir);
    for (const file of files) {
      await RNFS.unlink(file.path);
      console.log(`Deleted ${file.path}`);
    }
    console.log("Cache cleared successfully");
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
};