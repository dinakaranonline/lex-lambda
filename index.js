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
        case "AboutIntent":
            response.dialogAction.fulfillmentState = "Fulfilled";
            response.dialogAction.message.content = "Created by Nic Raboy at HERE";
            break;
        case "CalculateDistance":
            var source1 = event.currentIntent.slots.source;
            var destination1 = event.currentIntent.slots.destination;
            response.dialogAction.fulfillmentState = "Fulfilled";
            response.dialogAction.message.content = "Distance between "+source1+" and "+destination1+" is " + "500 miles";
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
