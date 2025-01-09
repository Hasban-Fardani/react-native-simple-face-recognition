import { View, Text } from 'react-native'
import React from 'react'
import { useFaceEmbeddingStore } from '@/stores/useFaceEmbeddingStore'

const Data = () => {
  const { embeddings } = useFaceEmbeddingStore()
  return (
    <View>
      <Text>length data saved: {embeddings?.length}</Text>
    </View>
  )
}

export default Data
