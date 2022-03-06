const http = require('http')
const { v4: uuidv4 } = require('uuid') // v4 是 UUID 想要的版本
const errorHandle = require('./errorHandler')
const todos = []

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  }

  let body = ''
  req.on('data', chunk => {
    body += chunk
  })

  if (req.url == '/todos' && req.method == 'GET') {
    res.writeHeader('200', headers)
    res.write(
      JSON.stringify({
        status: 'success!',
        data: todos,
      })
    )
    res.end()
  } else if (req.url == '/todos' && req.method == 'POST') {
    req.on('end', () => {
      try {
        let title = JSON.parse(body).title
        if (title) {
          todos.push({
            id: uuidv4(),
            title: title,
          })

          res.writeHeader('200', headers)
          res.write(
            JSON.stringify({
              status: 'success!',
              data: todos,
            })
          )
          res.end()
        } else {
          errorHandle(res)
        }
      } catch (error) {
        errorHandle(res)
      }
    })
  } else if (req.url == '/todos' && req.method == 'DELETE') {
    todos.length = 0

    res.writeHeader('200', headers)
    res.write(
      JSON.stringify({
        status: 'success!',
        data: todos,
      })
    )
    res.end()
  } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
    let id = req.url.split('/').pop()
    let index = todos.findIndex(ele => ele.id === id)
    if (index !== -1) {
      todos.splice(index, 1)
      res.writeHeader('200', headers)
      res.write(
        JSON.stringify({
          status: 'success!',
          data: todos,
        })
      )
      res.end()
    } else {
      errorHandle(res, '400')
    }
  } else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
    req.on('end', () => {
      try {
        let title = JSON.parse(body).title
        let id = req.url.split('/').pop()
        let index = todos.findIndex(ele => ele.id === id)

        if (title && index !== -1) {
          todos[index].title = title
          res.writeHeader('200', headers)
          res.write(
            JSON.stringify({
              status: 'success!',
              data: todos,
            })
          )
          res.end()
        } else {
          errorHandle(res, '001')
        }
      } catch (error) {
        errorHandle(res, '400')
      }
    })
  } else if (req.method == 'OPTIONS') {
    res.writeHeader('200', headers)
    res.end()
  } else {
    errorHandle(res, '404')
  }
}
const server = http.createServer(requestListener)

server.listen(process.env.PORT || '3005')
