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

//Función DELETE
app.delete("/api/v1/pedido/:id", (req, res) => {
    var id = req.params.id;
    var pedidos_unico = pedidos.pedidos.filter(x => x.id==id)
    if( pedidos_unico.length>0 )
    { 
        var pedidos2 = [];
        for(var i = 0; i < pedidos.pedidos.length; i++){
            if(pedidos.pedidos[i].id != id)
                pedidos2.push(pedidos.pedidos[i]);
        }
        pedidos.pedidos = pedidos2;
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("200 Delete Succesfully");
        res.end();
    }
    else
    {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found");
        res.end();
    }
});

//FUNCIÓN POST
app.post('/api/v1/pedido', function(req, res) {
    var pedido = req.body;
    var pedidos_unico = pedidos.pedidos.filter(x => x.id===pedido.id);
    if(pedidos_unico.length>0)
    {
        res.writeHead(409, {"Content-Type": "text/plain"});
        res.write("409 Conflict Item already exist");
        res.end();
    }
    else
    {
        pedidos.pedidos.push(pedido);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("201 Add Success");
        res.end();
    }  
});

//FUNCION PUT
app.put("/api/v1/pedido/:id", (req, res) => {
    var id = req.params.id;
    var pedidos_unico = pedidos.pedidos.filter(x => x.id==id)
    
    if( pedidos_unico.length > 0 )
    { 
        for(var item in pedidos.pedidos)
        {
            if(pedidos.pedidos[item].id==id)
            {
                pedidos.pedidos[item] = req.body;
            }
        }
        
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("204 Update item");
        res.end();
    }
    else
    {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found");
        res.end();
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