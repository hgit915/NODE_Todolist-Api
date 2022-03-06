const http = require('http')
const { v4: uuidv4 } = require('uuid') // v4 是 UUID 想要的版本
const errorHandle = require('./errorHandler')

// todos 要放在外層，不然會被 requestListener 洗掉
const todos = []

// 建立 server
// 要放在 server 前，不然話發生  Cannot access 'requestListener' before initialization => 因為 undefined
const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  }

  let body = '' // 用來拼湊成完整 request 送來的資料
  req.on('data', chunk => {
    // 監聽到 body 有資料就把 chunk 累加起來
    body += chunk
  })

  // 取得所有代辦
  if (req.url == '/todos' && req.method == 'GET') {
    res.writeHeader('200', headers)
    res.write(
      JSON.stringify({
        status: 'success!',
        data: todos,
      })
    )
    res.end() // 沒有寫上，瀏覽器會一直 loading 且顯示出來不會是 json view 的格式
  } else if (req.url == '/todos' && req.method == 'POST') {
    //新增代辦清單
    // 1. 取得 request 的 data => 使用 req.on("body")
    // 2. data 拼湊完成使用 req.on("data") 取出資料
    req.on('end', () => {
      // 3. 使用 try catch 避免拼湊出來的 data 格式不符
      try {
        let title = JSON.parse(body).title // // 拿到 req 資料 , body 為字串要轉成 obj
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
          errorHandle(res, '001')
        }
      } catch (error) {
        console.log(err)
        errorHandle(res)
      }
    })
  } else if (req.url == '/todos' && req.method == 'DELETE') {
    // 刪除全部的代辦清單
    // 不需要 req.on("end") ....因為沒有從 body 取得資料
    todos.length = 0 // 可將陣列清除
    res.writeHeader('200', headers)
    res.write(
      JSON.stringify({
        status: 'success!',
        data: todos,
      })
    )
    res.end()
  } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
    // 刪除單筆代辦清單
    // 使用 startsWith 要確保 todos 後面 / 還有東西

    let id = req.url.split('/').pop() // 取得 url，並擷取後面的 Id
    let index = todos.findIndex(ele => ele.id === id) // 找出 id 位在 array 索引位子

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
        let title = JSON.parse(body).title // 取得 body 內容
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
        errorHandle(res)
      }
    })
  } else if (req.method == 'OPTIONS') {
    // 不用寫 res.write
    res.writeHeader('200', headers) // 將 header 往後傳
    res.end()
  } else {
    errorHandle(res, '404')
  }
}

// hint :
// 拆解 requestListener 放 serve 後面錯誤的原因 => hoisting
// const server;
// const requestListner;
// server = http.createServer(requestListener)
// requestListener = (req,res)=>{
//     console.log("TEST");
// }
const server = http.createServer(requestListener)
server.listen(process.env.PORT || '3005')
