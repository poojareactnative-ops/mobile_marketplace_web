const fs = require('fs')
const path = require('path')

const DATA_DIR = path.resolve(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function filePath(collection) {
  ensureDir()
  return path.join(DATA_DIR, `${collection}.json`)
}

function readCollection(collection) {
  const p = filePath(collection)
  try {
    if (!fs.existsSync(p)) return []
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    console.error('readCollection error', collection, e)
    return []
  }
}

function writeCollection(collection, items) {
  const p = filePath(collection)
  fs.writeFileSync(p, JSON.stringify(items, null, 2), 'utf8')
}

function idFor(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

module.exports = {
  list(collection) {
    return readCollection(collection)
  },
  get(collection, id) {
    const items = readCollection(collection)
    return items.find((i) => i.id === id)
  },
  create(collection, data) {
    const items = readCollection(collection)
    const item = {
      id: data.id || idFor(collection),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    items.unshift(item)
    writeCollection(collection, items)
    return item
  },
  update(collection, id, patch) {
    const items = readCollection(collection)
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return null
    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
    writeCollection(collection, items)
    return items[idx]
  },
  remove(collection, id) {
    const items = readCollection(collection)
    const rest = items.filter((i) => i.id !== id)
    writeCollection(collection, rest)
    return true
  },
}