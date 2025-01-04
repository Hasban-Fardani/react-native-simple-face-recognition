import { create } from "zustand";

type FaceEmbeddingStore = {
  embeddings: number[] | null;
  image: string | null;
  setEmbeddings: (embeddings: number[]) => void;
  setImage: (image: string | null) => void;
  consineSimilarity: (a: number[], b: number[]) => number;
};

export const useFaceEmbeddingStore = create<FaceEmbeddingStore>((set) => ({
  embeddings: null,
  image: null,

  setEmbeddings(embeddings) {
    set({ embeddings });
  },

  setImage(image) {
    'worklet';
    console.log('save image: ', image)
    set({ image });
  },
  
  consineSimilarity(a, b) {
    'worklet';
    
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = a.reduce(
      (acc, value, index) => acc + value * b[index], 0
    );

    // Menghitung magnitudo masing-masing vektor
  const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));

  // Menangani kemungkinan divisi dengan nol
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
  }
}));