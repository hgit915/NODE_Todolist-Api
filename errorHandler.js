function errorHandle(res, code) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  }
  let message = ''

  switch (code) {
    case '001':
      resCode = 400
      message = '找不到物件屬性(title)，請確認 request'
      break
    case '400':
      resCode = 400
      message = '欄位填寫錯誤，或無此 todo id'
      break
    case '404':
      resCode = 404
      message = '404 not found!'
      break

    default:
      message = 'oops somethings wrong~'
      break
  }

  res.writeHead(resCode, headers)
  res.write(
    JSON.stringify({
      status: 'false',
      message: message,
    })
  )
  res.end()
}

module.exports = errorHandle
