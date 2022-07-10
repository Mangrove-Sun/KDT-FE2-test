import * as admin from 'firebase-admin'

const db = admin.firestore()

async function addFields() {
  const snaps = await db.collection('Todos').get()

  // forEach메소드 자체가 비동기처럼 기다렸다가 넘어가지 않는다.
  // forEach에서는 async, await가 되지 않는다.
  // snaps.forEach(async snap => {
  //   await snap.ref.update({
  //     deleted: false
  //   })
  // })
  // 기다렸다 넘어가게 만들기 위해 for문을 사용한다.
  for (const snap of snaps.docs) {
    const { image } = snap.data()
    if (!image) {
      snap.ref.update({
        image: null
      })
    }
  }
  console.log('완료!')
}
addFields()
