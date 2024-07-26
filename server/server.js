import express from 'express'
import path from 'path'
const app = express()

const __dirname = path.resolve(path.dirname(''))

app.use(express.static(path.join(__dirname, '../app/out')));
// app.use(express.static(path.join(__dirname, '../api')));

app.all('*', (req, res) => {
   res.status(404).send('Resource not found')
})

app.listen(5000, () => {
   console.log('Server is listening on http://localhost:5000... .')
})
