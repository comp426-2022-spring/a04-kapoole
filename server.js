const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`)


if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const fs = require('fs')
const morgan = require('morgan')
const db = require('./database.js')

var express = require("express")
const app = express()
const args = minimist(process.argv.slice(2))

app.use(express.urlencoded({extended:true}));
app.use(express.json());

args["port"]
const HTTP_PORT = args.port || 5000


const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
})

if (args.log){
    const WRITESTREAM = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('accesslog', {stream: WRITESTREAM }))
}

app.use( (req,res,next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next()
})

// if (args.debug){
//     app.get('/app/log/access', (req,res) => {
//         const stmt = db.prepare('SELECT * FROM accesslog').all()
//         res.statusCode = 200
//         res.json(stmt)
//     })
    
//     app.get('/app/error', (req,res) => {
//         throw new error ('Error test successful')
//     })
// }


app.get('/app/', (req, res) => {
    res.statusCode = 200
    res.statusMessage = "OK"
    res.writeHead(res.statusCode, {'Content-Type':'text/plain'})
    res.end(res.statusCode + ' ' + res.statusMessage)
});

app.get('/app/flip/', (req, res) => {
    res.status(200).json({"flip" : coinFlip()})
});

app.get('/app/flips/:number', (req, res) => {
    var flips = coinFlips(req.params.number)
    res.status(200).json({"raw" : flips, "summary" : countFlips(flips)})
});

app.get('/app/flip/call/heads', (req, res) => {
    var result = "lose"
    var flip = coinFlip()
    if (flip == "heads"){
        result ="win"
    }
    res.status(200).json({"call" : "heads", "flip" : flip, "result" : result})
});

app.get('/app/flip/call/tails', (req, res) => {
    var result = "lose"
    var flip = coinFlip()
    if (flip == "tails"){
        result ="win"
    }
    res.status(200).json({"call" : "tails", "flip" : flip, "result" : result})
});

app.use(function(req,res){
    res.status(404).send('404 NOT FOUND')
})


function coinFlip() {
    if(Math.floor(Math.random()*2) == 0){
      return "heads"
    } else {
      return "tails";
    }
  }


  function coinFlips(flips) {
    let coinFlips = new Array(flips);
    for(var i = 0; i < flips; i++){
      coinFlips[i] = coinFlip();
  
    }
    return coinFlips;
  }

  function countFlips(array) {

    let numheads = 0;
    let numtails = 0;
  
    for(var i = 0; i < array.length; i++){
      if(array[i] == "heads"){
        numheads++;
  
      }else{
        numtails++;
      }
    }
  
    return "{ heads: " + numheads + ", tails: " + numtails + " }";
  }

  app.use(function(req, res){
    const statusCode = 404
    const statusMessage = 'NOT FOUND'
    res.status(statusCode).end(statusCode+ ' ' +statusMessage)
});

process.on('SIGINT', () => {
    server.close(() => {
		console.log('\nApp stopped.');
	});
});