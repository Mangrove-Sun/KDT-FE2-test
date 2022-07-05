import * as admin from 'firebase-admin'
import * as express from 'express'

// firestore라는 db이다
const db = admin.firestore()
const router = express.Router()

interface Todo {
  id?: string
  title: string
  done: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
}

// Job
async function addEdeleted() {
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
    snap.ref.update({
      deleted: false
    })
  }
  console.log('완료!')
}

// http://localhost:5001/kdt-fe2-test/us-central1/api/todo
// 투두 조회
router.get('/', async (req, res) => {
  console.log('req.headers:', req.headers)
  console.log('req.body:', req.body)
  console.log('req.params:', req.params) // '/:todoId'의 :todoId 가 params이다.
  console.log('req.params:', req.query)

  // 쿼리한다 where('필드이름', '조건', '값')
  const snaps = await db.collection('Todos')
    .where('deleted', '!=', true)
    .get()

    // 처리
    const todos: Todo[] = []
    snaps.forEach(snap => {
      const fields = snap.data()
      todos.push({
        id: snap.id,
        ...fields as Todo
      })
    })
    
  todos.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  res.status(200).json(todos)
})

// 투두 추가
router.post('/', async (req, res) => {
  const { title } = req.body
  const date = new Date().toISOString()
  const todo: Todo = {
    title,
    done: false,
    createdAt: date,
    updatedAt: date,
    deleted: false
  }
  const ref = await db.collection('Todos').add(todo)

  res.status(200).json({
    id: ref.id, // 응답에 id값을 추가
    ...todo
  })
})
// 투두 수정
router.put('/:id', async (req, res) => {
  const {title, done } = req.body
  const { id } = req.params

  const snap = await db.collection('Todos').doc(id).get()
  // 존재하는지 않하는지
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }
  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toISOString()
  await snap.ref.update({
    title,
    done,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    done,
    createdAt,
    updatedAt,
    deleted: false
  })
})
// 투두 삭제
// router.delete('/:id', async (req, res) => {
//   const { id } = req.params

//   const snap = await db.collection('Todos').doc(id).get()
//   await snap.ref.delete()

//   res.status(200).json(true)
// })

// 투두 삭제된 것 처럼 보이게
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const snap = await db.collection('Todos').doc(id).get()
  // 존재하는지 않하는지
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }
  await snap.ref.update({
    deleted: true
  })

  res.status(200).json(true)
  return
})

export default router
