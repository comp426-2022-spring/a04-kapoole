import express from 'express'
import minimist from 'minimist'
const app = express()
const args = minimist(process.argv.slice(2))
args["port"]
const HTTP_PORT = args.port || 5000

const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
})

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