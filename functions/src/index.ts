// CommonJS => require(), module.exports
// ESM -> import, export
import * as admin from 'firebase-admin'
admin.initializeApp()

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import todo from './routes/todo'

const app = express()
app.use(express.json())
app.use(cors()) // 모든 요청을 허용하게 한다. { 특정요청만 받을 수 있게 설정 가능 }
app.use('/todo', todo)

export const api = functions.https.onRequest(app)
// http://localhost:5001/kdt-fe2-test/us-central1/api/todo
// https://us-contral1-kdt-fe2-test.cloudfunctions.net/api/todo
