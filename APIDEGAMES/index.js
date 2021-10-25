const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

//senha para criptografar e descriptografar o token
const JWTkey = "djkshahjksdajksdhasjkdhasjkdhasjkdhasjkd";

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//middleware: função executada antes do retorno da rota pelo servidor
function auth(req, res, next){

    const authToken = req.headers['authorization']

    if(authToken != undefined){

        const bearerRemover = authToken.split(' ')
        const token = bearerRemover[1]
        
        //verifica retorna um erro ou os dados 
        jwt.verify(token, JWTkey, (err, data) => {
            if(err){
                res.status(401)
                res.json({err: "token inválido"})
            } else {
                console.log(data)
                req.token = token
                req.loggedUser = {id: data.id, email: data.email}
                //criando duas variáveis dentro do objeto de requisição, que podem ser acessadas dentro da rota (quando a rota usar o middleware)

                next() //chama a execução da rota. Neste caso, apenas se a autenticação ocorrer corretamente
            }
        })
        


    } else {
        res.status(401)
        res.json({err: "Token inválido"})
    }


    /* const authToken = req.headers['authorization'];

    if(authToken != undefined){

        const bearer = authToken.split(' ');
        var token = bearer[1];

        jwt.verify(token,JWTSecret,(err, data) => {
            if(err){
                res.status(401);
                res.json({err:"Token inválido!"});
            }else{

                req.token = token;
                req.loggedUser = {id: data.id,email: data.email};
                req.empresa = "Guia do programador";                
                next();
            }
        });
    }else{
        res.status(401);
        res.json({err:"Token inválido!"});
    }  */
}

var DB = {
    games: [
        {
            id: 23,
            title: "Call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users: [
        {
            id: 1,
            name: "flavia",
            email: "flavia@gmail.com",
            password: "node"
        },
        {
            id: 2,
            name: "Nubia",
            email: "nubia@gmail.com",
            password: "java"
        }
    ]
}

app.get("/games",auth,(req, res) => {
    res.statusCode = 200;
    res.json({user: req.loggedUser, games: DB.games})
    //acessando as variáveis criadas no objeto de requisição
});


//inserindo o middleware em todas as rotas que precisam de autenticacao
app.get("/game/:id",auth,(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

app.post("/game",auth,(req, res) => { 
    var {title, price, year} = req.body;
    DB.games.push({
        id: 2323,
        title,
        price,
        year
    });
    res.sendStatus(200);
})

app.delete("/game/:id",auth,(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.sendStatus(200);
        }
    }
});

app.put("/game/:id",(req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){

            var {title, price, year} = req.body;

            
            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }
            
            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }
    }

});


app.post("/auth",(req, res) => {

    var {email, password} = req.body;

    if(email != undefined){

        var user = DB.users.find(u => u.email == email);
        if(user != undefined){
            if(user.password == password){
                jwt.sign({id: user.id, email: user.email},JWTkey,{expiresIn:'48h'},(err, token) => {
                    if(err){
                        res.status(400);
                        res.json({err:"Falha interna"});
                    }else{
                        res.status(200);
                        res.json({token: token});
                    }
                })
            }else{
                res.status(401);
                res.json({err: "Credenciais inválidas!"});
            }
        }else{
            res.status(404);
            res.json({err: "O E-mail enviado não existe na base de dados!"});
        }

    }else{
        res.status(400);
        res.send({err: "O E-mail enviado é inválido"});
    }
});

app.listen(45678,() => {
    console.log("API RODANDO :)");
});


/*  
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmbGF2aWFAZ21haWwuY29tIiwiaWF0IjoxNjM1MTgwNzM1LCJleHAiOjE2MzUzNTM1MzV9.6NPQcHjPnWseH5UQZrhLsXF_oMjErHzurgjh5zBbmGw"
}

*/