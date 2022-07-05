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
    // .where('done', '==', false)
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
    updatedAt: date
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
  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toISOString()
  await snap.ref.update({
    title,
    done,
    updatedAt
  })



  res.status(200).json({
    id: snap.id,
    title,
    done,
    createdAt,
    updatedAt
  })
})
// router.delete('')

export default router
