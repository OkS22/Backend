require('dotenv').config()
const { json } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('record', function getRecord (req) {
    if (req.method='POST') {
        return JSON.stringify(req.body)
    } else {
        return null
    }
  })
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :record' ))
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const amount = persons.length
    vastaus = `<p>Phonebook has info for ${amount} people</p>`
    +`<p> ${Date()} </p>`
     response.send(vastaus)
  })    
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result);  
      if (result) {
        response.status(204).end()
      } else {
        response.status(400).send({ error: `Information has already been removed from server! Refresh your page!` })
      }
      
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response,next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number
  })
  Person.findOne({name:person.name})
  .then(fperson => {
    console.log(fperson);
    if (fperson) {//already exict
      response.status(400).json({ error: `${person.name} is already in database. Refresh your page!` })
    } else {
      person.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
    }
  })
  .catch(error => next(error)) 
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name,number} = request.body
  
  Person.findByIdAndUpdate(
    request.params.id,
    {name,number},
    { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      console.log(error);
      next(error)})
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }   
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})  