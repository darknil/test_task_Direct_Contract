import axios from 'axios'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import credentials from './credentials.json' assert { type: 'json' }

const URL = 'http://94.103.91.4:5000'
const USERNAME = 'darknil123'
const GOOGLE_SHEET_ID = '1c2IsVDb9REv-Ykx-KwYZPqJtgXY8p9KE1X79bUP2Q5M'

const registerUser = async () => {
  try {
    const registered = await axios.post(`${URL}/auth/registration`, {
      username: USERNAME
    })
    console.log('User registered successfully:', registered.data)
  } catch (error) {
    console.log('registration error', error)
  }
}
const loginUser = async () => {
  try {
    const logged = await axios.post(`${URL}/auth/login`, {
      username: USERNAME
    })
    console.log('User logged in successfully:', logged.data)
    return logged.data.token
  } catch (error) {
    console.log('login error', error)
  }
}
const getUsers = async (token) => {
  try {
    const limit = 1000
    const offset = 0
    const query = `?limit=${limit}&offset=${offset}`
    const users = await axios.get(`${URL}/clients${query}`, {
      headers: {
        Authorization: `${token}`
      }
    })
    return users.data
  } catch (error) {
    console.log('get users error', error)
  }
}
const createTable = async (users) => {
  try {
    const serviceAccountAuth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()
    let sheet = doc.sheetsByIndex[0]
    console.log(`Лист найден: ${sheet.title}`)
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Sheet1',
        headerValues: [
          'id',
          'firstName',
          'lastName',
          'gender',
          'address',
          'city',
          'phone',
          'email'
        ]
      })
      console.log(`Лист создан: ${sheet.title}`)
      await doc.loadInfo()
    } else {
      await sheet.setHeaderRow([
        'id',
        'firstName',
        'lastName',
        'gender',
        'address',
        'city',
        'phone',
        'email'
      ])
    }
    await sheet.addRows(users)
  } catch (error) {
    console.log('create table error', error)
  }
}
const app = async () => {
  await registerUser()
  const token = await loginUser()
  const users = await getUsers(token)
  await createTable(users)
}
app()
