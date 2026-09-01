// Simple client-side service storing repair problems in localStorage
const STORAGE_KEY = 'repair_problems'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('readAll error', e)
    return []
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function createProblem(data) {
  const problems = readAll()
  const id = `rp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  const item = {
    id,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    sellerId: data.sellerId || 'local',
    ...data,
  }
  problems.unshift(item)
  writeAll(problems)
  return item
}

export function getProblems() {
  return readAll()
}

export function getProblemById(id) {
  const problems = readAll()
  return problems.find((p) => p.id === id)
}

export function clearProblems() {
  localStorage.removeItem(STORAGE_KEY)
}

export default { createProblem, getProblems, getProblemById, clearProblems }
