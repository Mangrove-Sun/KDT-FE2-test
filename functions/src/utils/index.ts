import * as admin from 'firebase-admin'

export async function saveFile(base64: string, bucketName = 'images') {
  const bucket = admin.storage().bucket(bucketName)
  const [ , body] = base64.split(',')

  // firebase 코드
  const buffer = Buffer.from(body, 'base64')
  const file = bucket.file('image.png')
  await file.save(buffer)

  return process.env.NODE_ENV === 'development'
    ? `http://localhost:9199/${bucketName}/image.png`
    : `https://storage.googleaips.com/${bucketName}/image.png`
}
