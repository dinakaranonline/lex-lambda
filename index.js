const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();


const dispatcher = async (event) => {
    let response = {
        sessionAttributes: event.sessionAttributes,
        dialogAction: {
            type: "Close",
            fulfillmentState: "",
            message: {
                "contentType": "PlainText",
                "content": ""
            }
        }
    };
    console.log("source###"+event.currentIntent.slots.source);
    console.log("destination###"+event.currentIntent.slots.destination);
    switch(event.currentIntent.name) {
        case "CalculateDistance":
            var source1 = event.currentIntent.slots.source;
            var destination1 = event.currentIntent.slots.destination;
           
             var params = {
             TableName : "distance_graph",
             Key: { 
                 sourceCity: source1, 
                 targetCity: destination1
             },
                };
            const data = await docClient.get(params).promise();
            const item = data.Item;
            //Error handling
            if(item!=null){
            console.log("dynamodb fetch"+JSON.stringify(item));
            console.log("distance ###"+item.distance);
            response.dialogAction.message.content = item.distance;
            }
            else response.dialogAction.message.content = "Details not available. Please provide valid source and destination";
            response.dialogAction.fulfillmentState = "Fulfilled";
            break;    
        default:
            response.dialogAction.fulfillmentState = "Failed";
            response.dialogAction.message.content = "I don't know what you're asking...";
            break;
    }
    console.log("fulfillmentState###"+response.dialogAction.fulfillmentState);
    console.log("content###"+response.dialogAction.message.content);
    return response;
}



exports.handler = (event, context) => {
    return dispatcher(event);
}
