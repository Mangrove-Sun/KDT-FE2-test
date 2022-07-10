import * as admin from 'firebase-admin'
import * as express from 'express'
import { saveFile } from '../utils'

// firestore라는 db이다
const db = admin.firestore()
const router = express.Router()

interface Todo {
  id?: string
  title: string
  image?: string | null
  done: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
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

  // sort 정렬 (최신순)
  todos.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  res.status(200).json(todos)
})

// 투두 추가
router.post('/', async (req, res) => {
  const { title, imageBase64 } = req.body
  const date = new Date().toISOString()

  // 스토리지에 파일 저장
  const image = await saveFile(imageBase64)
  
  const todo: Todo = {
    title,
    image,
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
  const {title, done, imageBase64 } = req.body
  const { id } = req.params

  const snap = await db.collection('Todos').doc(id).get()
  // 존재하는지 않하는지
  if (!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  // 스토리지에 파일 저장
  const image = await saveFile(imageBase64)

  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toISOString()
  await snap.ref.update({
    title,
    done,
    image,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    done,
    image,
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

function abc() {return 123}
const a = function () { return 123  }
