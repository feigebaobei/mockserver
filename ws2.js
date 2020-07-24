// var express = require('express');
// var utils = require('./lib/utils.js')
// var tokenSDKServer = require('token-sdk-server')
var config = require('./lib/config')
const redisClient = require('./redisClient.js')
const http = require('http')
const WebSocket = require('ws')
const server = http.createServer()
const wss2 = new WebSocket.Server({noServer: true})


wss2.on('connection', (ws, req, client) => {
  console.log('connection')
  ws.on('message', (msg) => {
    ws.send(`receiver ${msg}`)
  })
})

server.on('upgrade', (request, socket, head) => {
  console.log(request, socket, head)
  wss2.handleUpgrade(request, socket, head, (ws) => {
    wss2.emit('connection', ws, request, head)
  })
})
server.listen(9123)