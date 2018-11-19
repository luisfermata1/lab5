var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var redis = require("redis");
var redis_client = redis.createClient(6379, 'redisdns.westus.azurecontainer.io');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var pedidos = {"pedidos":[
    { id: 1, nombre: 'iPhone8', cantidad: 5},
    { id: 2, nombre: 'iPhoneX', cantidad: 2},
    { id: 3, nombre: 'iPhone7', cantidad: 3}
  ]};


var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var db;
var collection;

MongoClient.connect("mongodb://mongodns.westus.azurecontainer.io:27017", { useNewUrlParser: true, poolSize: 10 }).then(client => {
    db = client.db('TiendaApple');
    collection = db.collection('pedidos');
}).catch(error => console.error(error));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
      // console.log(req);
      return res.sendStatus(200);
    } else {
      return next();
    }
  });

//Función Get
app.get("/api/v1/pedido/:id?", (req, res) => {
    var id = req.params.id;
    if (id===undefined)
    {
        res.writeHead(200, {"Content-Type": "application/json"});
        collection.find({}).toArray().then(response => {
			if (response.length > 0) {
                res.write(JSON.stringify(response));
                res.end();
			} else {
                res.sendStatus(404);
                res.end();
			}
        }).catch(error => console.error(error));
        
    }
    else
    {
        GetPedido(id).then(function(results) {
            
            if(results.length == 0)
            {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify(results));
                res.end();   
            }
            else
            {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.write(JSON.stringify(results[0]));
                res.end();
            }
        })
    }
});

function GetPedido(id)
{
    return new Promise(function(resolve,reject){
        //se verifica si el registro se encuentra en el redis, sino se busca en el mongo
        console.log("trata entrar redis");
        Buscar_redis(id).then(function(redis_results){

            if (redis_results === JSON.parse(null))
            {
                //no se encontro en le redis, por lo que hace una busqueda en BD
                console.log("entro al de mongo");
                collection.find({_id : ObjectId(id)}).toArray().then(response => {
                    if (response.length > 0) {
                        Insertar_redis(id,response[0]);
                    } 
                    resolve(response);

                }).catch(error => console.error(error));
            }
            else
            {
                //la consulta se hace por medio de redis
                console.log("entro al redis");
                resolve([redis_results]);
            }
        }).catch(error => console.error(error));
    })

}

//Función DELETE
app.delete("/api/v1/pedido/:id", (req, res) => {
    var id = req.params.id;
    Borra_redis(id);
    collection.deleteOne({_id : ObjectId(id)}, function(err, res) {
        if (err) throw err;
    });
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("200 Delete Succesfully");
    res.end();
});

//FUNCIÓN POST
app.post('/api/v1/pedido', function(req, res) {
    var pedido = req.body;
    collection.insertOne(pedido, function(err, res) {
        if (err) throw err;
      });

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("201 Add Success");
    res.end();
});

//FUNCION PUT
app.put("/api/v1/pedido/:id", (req, res) => {
    var id = req.params.id;
    Borra_redis(id);
    collection.updateOne(
        { _id: ObjectId(id)}, // Filter
        {$set: { name: req.body.name, cant: req.body.cant, color: req.body.color, capac: req.body.capac, descr: req.body.descr}} // Update
    )
    .then(response => {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("204 Update item");
        res.end();
    })
    .catch(error => {
        console.error(error)
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found");
        res.end();
    });
});


                    //FUNCIONES REDIS

//Realizar busquedas en redis
function Buscar_redis(id)
{
    return new Promise(function(resolve,reject){
        redis_client.get(id, function(error, result) {
            if (error) reject('Error en la lectura redis');
            else resolve(JSON.parse(result));
        });
    });
}

//insertar datos en redis
function Insertar_redis(id,object)
{
    redis_client.set(id, JSON.stringify(object), redis.print);
}

//Borrar del redis
function Borra_redis(id)
{
    redis_client.del(id);
}



//función para crear servidor
function apiServer(){
    app.listen(3000, () => {
    console.log("Server running on port 3000");
    });
}

//ping a redis
setInterval(function(){
    //console.log("Entered to ping");
    redis_client.ping(function (err, result){
      if(result){
        console.log("Redis pinged");
      }

      if(err){
        console.log("There was an error " + err);
      }
    })

  }, 6000)



//ejecutar servidor
apiServer();