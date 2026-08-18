import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export default client
