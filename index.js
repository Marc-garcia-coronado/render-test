const express = require('express')
const cors = require('cors')
const app = express()

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// Cross-Origin Resource Sharing
app.use(cors());
// json-parser de express -> para que se pueda acceder a request.body
app.use(express.json())
// Middleware para cargar nuestro front-end
app.use(express.static('dist'))
// Nuestro Middleware que nos printa la informacion de las requests
app.use(requestLogger)
// Middleware para cuando la ruta sea inexistente
// app.use(unknownEndPoint)

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/notes', (request, response) => {

    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: Boolean(body.important) || false,
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})

app.put('/api/notes/:id', (request, response) => {
    // By default request.params.id is a String, we have to convert it to a Number to be able find the index correctly
    const id = Number(request.params.id)

    const noteIndex = notes.findIndex(n => n.id === id)

    if (noteIndex !== -1) {
        const note = notes[noteIndex]

        notes[noteIndex].important = !note.important

        response.json(notes[noteIndex])
    } else {
        response.status(404).json({ error: "Note not found" })
    }
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
