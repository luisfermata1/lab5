var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var pedidos = {"pedidos":[
    { id: 1, nombre: 'iPhone8', cantidad: 5},
    { id: 2, nombre: 'iPhoneX', cantidad: 2},
    { id: 3, nombre: 'iPhone7', cantidad: 3}
  ]};

//Función Get
app.get("/api/v1/pedido/:id?", (req, res) => {
    var id = req.params.id;
    if (id===undefined)
    {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(pedidos));
        res.end();
    }
    else
    {
        var pedidos_unico = pedidos.pedidos.filter(x => x.id==id)
        if( pedidos_unico.length>0 )
        {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify(pedidos_unico));
            res.end();  
            
        }
        else
        {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not found");
            res.end();
        }
        
    }
});

//función para crear servidor
function apiServer(){
    app.listen(3000, () => {
    console.log("Server running on port 3000");
    });
}


//ejecutar servidor
apiServer();