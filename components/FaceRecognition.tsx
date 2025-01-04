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
  runAsync,
  useCameraDevice,
  useFrameProcessor,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";
import {
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { useResizePlugin } from "vision-camera-resize-plugin"
import { Worklets } from "react-native-worklets-core";
import { Image } from "react-native";
import { useTensorflowLiteModel } from "@/stores/useTensorflowLiteModel";
import { useFaceEmbeddingStore } from "@/stores/useFaceEmbeddingStore";


const SIZE = 112

const FaceRecognition = () => {
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
  const [faceDetected, setFaceDetected] = useState<number>(0);
  const [consineSimilarityValue, setConsineSimilarityValue] = useState(0);
  
  const setDetectedFaceJS = Worklets.createRunOnJS(setDetectedFace);
  const setConsineSimilarityValueJS = Worklets.createRunOnJS(setConsineSimilarityValue);
  const setFaceDetectedJS = Worklets.createRunOnJS(setFaceDetected);
  
  const { embeddings, consineSimilarity } = useFaceEmbeddingStore();
  const { model } = useTensorflowLiteModel()
  useEffect(() => {
    setIsModalOpen(!detectedFace);
  }, [detectedFace]);

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    "worklet";
    const faces = detectFaces(frame);

    // setDetectedFaceJS(faces.length > 0);
    setFaceDetectedJS(faces.length)

    if (faces.length == 0 || !model) {
      return
    }

    const firsFace = faces[0]

    const oriH = firsFace.bounds.height
    const oriW = firsFace.bounds.width
    const oriX = firsFace.bounds.x
    const oriY = firsFace.bounds.y
    const cropX = frame.width - oriX - oriH
    const cropY = frame.height - oriY - oriW

    // console.log('cropx', cropX);

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
    })

    if (!embeddings) return

    const faceData = model.runSync([data]);
    const newEmbeddings = Object.values(faceData[0]);
    // console.log(embeddings)
    const similarity = consineSimilarity(embeddings, newEmbeddings);
    // console.log('similarity: ', similarity);
    setConsineSimilarityValueJS(similarity * 100);
  }, [model]);

  if (!device) {
    return <Text>Tidak support kamera</Text>;
  }

  if (!embeddings) {
    return <Text>Tidak ada data wajah</Text>
  }

  return (
    <>
      <Modal visible={faceDetected == 0} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Tidak ada wajah</Text>
          </View>
        </View>
      </Modal>

      {consineSimilarityValue > 50 && faceDetected > 0 ? (
        <Modal visible={faceDetected > 0} transparent>
          <View style={styles.modalOverlay}>
            <View style={{}}>
              <Text >Kecocokan wajah: {consineSimilarityValue.toPrecision(2)} %</Text>
            </View>
          </View>
        </Modal>
      ) : (
        <Modal visible={faceDetected > 0} transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text>Kecocokan kurang dari 50%</Text>
            </View>
          </View>
        </Modal>
      )}

      <Camera
        device={device}
        isActive={true}
        style={styles.camera}
        ref={camera}
        photo={true}
        frameProcessor={frameProcessor}
      />
    </>
  );
};

export default FaceRecognition;

const BUTTON_SIZE = 90;
const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    display: 'flex',
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    // paddingBottom: 60,
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
  messageContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // position: 'absolute',
    // top: 0,
  }
});
