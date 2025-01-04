import { TensorflowModel } from "react-native-fast-tflite";
import { create } from "zustand";

type TensorflowLiteModel = {
  model: TensorflowModel | null
  setModel: (model: TensorflowModel) => void
}

export const useTensorflowLiteModel = create<TensorflowLiteModel>()((set) => ({
  model: null,
  setModel: (model: any) => set(() => ({ model })),
}))