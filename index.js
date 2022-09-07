const { json } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

morgan.token('record', function getRecord (req) {
    if (req.method='POST') {
        return JSON.stringify(req.body)
    } else {
        return null
    }
  })
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :record' ))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Server for phonebook</h1>')
})

app.get('/info', (request, response) => {
    amount = persons.length
    vastaus = `<p>Phonebook has info for ${amount} people</p>`
    +`<p> ${Date()} </p>`
    response.send(vastaus)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  })

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  /* const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1 */
    let min = 10
    let max = 1000000
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  //The name or number is missing
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing (name or phonenumber)' 
    })
  }
    //The name already exists in the phonebook
  const objectsEqual = (first, second)=> {
    const f=first.toLowerCase().trim()
    const s=second.toLowerCase().trim()
    if (f === s) {
      return true
    }
  }
  let checkAll = false //found
  persons.forEach(person => {
    if (objectsEqual(person.name, body.name)) {
      checkAll = true
      }
    }) 
    if (checkAll) {
        return response.status(400).json({ 
            error: `${body.name} is already added. A name must be unique` 
        })
    }    
    //end for checking

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
  