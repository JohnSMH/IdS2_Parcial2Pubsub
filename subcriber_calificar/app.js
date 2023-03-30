//
// Copyright 2021 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const express = require('express');
const bodyParser = require('body-parser');
const lzbase62 = require("lzbase62")
const axios = require("axios")

const app = express();
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3002;
const daprPort = process.env.DAPR_HTTP_PORT ?? 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const pubsubName = 'pubsub';

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "Calificar",
            route: "Calificar"
        }
    ]);
});


app.post('/Calificar', async (req, res) => {
    console.log("Resultado Comprimido: ", req.body.data.message)
    let str = ""
    if(req.body.data.message.includes("Ingeniero")){
        //EMITIR RECHAZO
        console.log("Rechazo")
        req.body.data.messageType = "Rechazo"
        const result = await axios.post(`${daprUrl}/publish/${pubsubName}/${req.body.data?.messageType}`, req.body.data);
    } else {
        //COMPRIMIR
        console.log("No rechazo")
        req.body.data.message = lzbase62.compress(req.body.data.message)
        req.body.data.messageType = "Compresion"
        const result = await axios.post(`${daprUrl}/publish/${pubsubName}/${req.body.data?.messageType}`, req.body.data);
        req.body.data.messageType = "Resultado"
        const result2 = await axios.post(`${daprUrl}/publish/${pubsubName}/${req.body.data?.messageType}`, req.body.data);
    }
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
