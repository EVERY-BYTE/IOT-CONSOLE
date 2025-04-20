/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { firebaseConfigs } from '../configs'

interface IUploadImageTypes {
  selectedFile: any
  getImageUrl: (url: string) => any
}

export const handleUploadImageToFirebase = async ({
  selectedFile,
  getImageUrl
}: IUploadImageTypes) => {
  const imageRef = ref(firebaseConfigs.storage, 'e-commerce/' + 'IMG' + Date.now())
  uploadBytesResumable(imageRef, selectedFile)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then(getImageUrl)
    })
    .catch((error) => {
      console.error('Upload failed', error)
    })
}
