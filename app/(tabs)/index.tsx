import CameraSection from "@/components/CameraSection";
import { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useCameraPermission } from "react-native-vision-camera";

export default function HomeScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    const requestPermission = async () => {
      if (!hasPermission) {
        await requestPermission();
        console.log("akses kamera diizinkan");
      }
    };

    requestPermission();
    console.log("punya akses kamera: ", hasPermission);
  }, []);

  const handleRequestAccess = async () => {
    await requestPermission();
    console.log("akses kamera telah diberikan");
  };

  if (hasPermission) {
    return <CameraSection />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>akses kamera tidak diizinkan</Text>
      <TouchableOpacity onPress={handleRequestAccess} style={styles.button}>
        <Text style={styles.text}>Izinkan kamera</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 4,
    backgroundColor: "blue",
    color: "white",
  },
});
