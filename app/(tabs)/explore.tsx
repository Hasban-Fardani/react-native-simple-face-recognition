import FaceRecognition from '@/components/FaceRecognition';
import { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { StyleSheet, Image, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useCameraPermission } from 'react-native-vision-camera';

export default function TabTwoScreen() {
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
    return <FaceRecognition/>;
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
