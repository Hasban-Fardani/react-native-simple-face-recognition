import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Frame,
  runAtTargetFps,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { useResizePlugin } from "vision-camera-resize-plugin";
import { useSharedValue, Worklets } from "react-native-worklets-core";
import { Image } from "react-native";
import { useTensorflowLiteModel } from "@/stores/useTensorflowLiteModel";
import { useFaceEmbeddingStore } from "@/stores/useFaceEmbeddingStore";

const SIZE = 112;

const CameraSection = () => {
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    landmarkMode: "all",
    minFaceSize: 0.7,
  }).current;

  const device = useCameraDevice("front");
  const camera = useRef<Camera>(null);
  const { detectFaces } = useFaceDetector(faceDetectionOptions);
  const { resize } = useResizePlugin();
  const [detectedFace, setDetectedFace] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [onRecognize, setOnRecognize] = useState(false);
  const { embeddings, setEmbeddings } = useFaceEmbeddingStore();
  const image = useSharedValue<string | null>(null);

  const setDetectedFaceJS = Worklets.createRunOnJS(setDetectedFace);
  const setIsCameraActiveJS = Worklets.createRunOnJS(setIsCameraActive);
  const setEmbeddedImageJS = Worklets.createRunOnJS(setEmbeddings);
  const setOnRecognizeJS = Worklets.createRunOnJS(setOnRecognize);

  const { model } = useTensorflowLiteModel();
  useEffect(() => {
    setIsModalOpen(!detectedFace);
  }, [detectedFace]);

  const handleTakePhoto = async () => {
    console.log("handle ambill foto");
    if (!camera.current) {
      console.log("ga ada kameranya euy");
      return;
    }

    try {
      const file = await camera.current.takePhoto();
      image.value = `file://${file.path}`;
      console.log("yey bisa ngambil gambar: ", image.value);
    } catch (error) {
      console.error("Error pas ngambil foto: ", error);
    }
  };

  const frameProcessor = useFrameProcessor(
    (frame: Frame) => {
      "worklet";
      const faces = detectFaces(frame);

      setDetectedFaceJS(faces.length > 0);

      if (!model) {
        console.log("gada model");
        return;
      }

      const firsFace = faces[0];
      if (!firsFace) {
        console.log("▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ gada wajah ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓");
        return;
      }

      runAtTargetFps(1, () => {
        'worklet';
        if (!image.value) {return }
  
        const oriH = firsFace.bounds.height;
        const oriW = firsFace.bounds.width;
        const oriX = firsFace.bounds.x;
        const oriY = firsFace.bounds.y;
        const cropX = frame.width - oriX - oriH;
        const cropY = frame.height - oriY - oriW;


        const data = resize(frame, {
          scale: {
            width: SIZE,
            height: SIZE,
          },
          crop: {
            x: cropX,
            y: cropY,
            width: oriH,
            height: oriW,
          },
          pixelFormat: "rgb",
          dataType: "float32",
          rotation: "270deg",
          mirror: true,
        });
        
      if (!data || onRecognize) return
        
      // setTimeout(async () => {
        'worklet';
        setOnRecognizeJS(true)
        console.log("=== do recognize ===");
        const embed = model.runSync([data]);
        const embedData = Object.values(embed[0]);
  
        console.log("selesai recognize");
        setEmbeddedImageJS(embedData);
        setIsCameraActiveJS(false);
        setOnRecognizeJS(false);
        // }, 100)
      });
    },
    [model]
  );

  if (!device) {
    return <Text>Tidak support kamera</Text>;
  }

  if (!isCameraActive && image.value) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: image.value }} style={styles.capturedImage} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Modal visible={isModalOpen} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Tidak ada wajah</Text>
          </View>
        </View>
      </Modal>

      <Camera
        device={device}
        isActive={isCameraActive}
        style={styles.camera}
        ref={camera}
        photo={true}
        frameProcessor={frameProcessor}
      />
      <View>
        <TouchableOpacity
          style={{ ...styles.button, opacity: detectedFace ? 1 : 0.5 }}
          onPress={handleTakePhoto}
          disabled={!detectedFace}
        />
      </View>
    </>
  );
};

export default CameraSection;

const BUTTON_SIZE = 90;
const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    alignContent: "center",
    margin: "auto",
    left: Dimensions.get("window").width / 2 - BUTTON_SIZE / 2,
    bottom: 30,
    zIndex: 10,
    backgroundColor: "red",
    borderRadius: 100,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  modal: {
    backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  modalItem: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  capturedImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
