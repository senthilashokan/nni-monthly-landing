import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    PutCommand,
    ScanCommand,
    DeleteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getUserAttributesFromToken, convertKeysToCamelCase } from './authUtils.mjs'

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
export const handler = (event) => {
    const { resourcePath, body, id } = event;
    const token = event.headers.Authorization || null;
    const group = event.headers.Group || null;
    let finalResponse = null;
    switch (resourcePath) {
        case "/nbrx-forecast":
            finalResponse = createNewNbrxForecast(body, token);
            break;
        case "/nbrx-save-forecast":
            finalResponse = saveNbrxForecast(body, token);
            break;
        case "/nbrx-models":
            finalResponse = getForecastModels(group);
            break;
        case "/all-nbrx-forecast":
            finalResponse = getNBRxForecasts(body, token);
            break;
        case "/delete-nbrx-forecast":
            finalResponse = deleteNBRxForecast(id, token);
            break;
        case "/share-nbrx-forecast":
            finalResponse = shareNBRxForecast(body, token);
            break;
        case "/unshare-nbrx-forecast":
            finalResponse = unShareNBRxForecast(id, token);
            break;
        case "/all-nbrx-shared-forecast":
            finalResponse = getNBRxSharedForecasts(body, token);
            break;
        default:
            finalResponse = null;
    }
    return finalResponse;
};

// Create a New Nbrx Forecast
const createNewNbrxForecast = async (body, idToken) => {
    try {
        const requestData = body;
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'Create NBRx Forecast',
            data: {
                product: requestData.product,
                model_type: requestData.model_type
            },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        // Make a POST request to the external API endpoint
        const response = await axios.post(process.env.DATAIKU_NBRX_CREATE_FORECAST, requestData);
        const responseData = JSON.stringify(response.data);
        const parsedResponse = JSON.parse(responseData);
        // console.log("responseData::" + responseData);
        //console.log("response::" + JSON.stringify(parsedResponse));
        // console.log("Response::" + parsedResponse.response);
        const finalResponse = JSON.parse(parsedResponse.response);
        // Extracting the forecast start date
        const forecastStartDate = finalResponse["Forecast Start Date"];
        const modelName = finalResponse["Model Name"];
        const bounds = finalResponse["Bounds"];
        const modelType = finalResponse["Model Type"];
        // Extracting the result data
        const resultData = JSON.parse(finalResponse.result);
        // Extracting columns and data
        const columns = resultData.columns;
        const data = resultData.data;

        // Extracting dates and values for nbrx and trx
        const dates = data.map(entry => entry[0]);
        const nbrxValues = data.map(entry => entry[1]);
        const trxValues = data.map(entry => entry[2]);
        // console.log("dates::" + dates);
        // console.log("nbrxValues::" + nbrxValues);
        // console.log("trxValues::" + trxValues);
        // Filtering data based on forecast start date for nbrx and trx
        const historicalNbrxValues = nbrxValues.filter((value, index) => new Date(dates[index]) < new Date(forecastStartDate));
        const futureNbrxValues = nbrxValues.filter((value, index) => new Date(dates[index]) >= new Date(forecastStartDate));
        const historicalTrxValues = trxValues.filter((value, index) => new Date(dates[index]) < new Date(forecastStartDate));
        const futureTrxValues = trxValues.filter((value, index) => new Date(dates[index]) >= new Date(forecastStartDate));
        // console.log("historicalNbrxValues::" + historicalNbrxValues);
        // console.log("futureNbrxValues" + futureNbrxValues);
        // console.log("historicalTrxValues::" + historicalTrxValues);
        // console.log("futureTrxValues" + futureTrxValues);
        // Creating the final formatted response
        return {
            "ForecastStartDate": forecastStartDate,
            "Date": dates,
            "NbrxHistory": historicalNbrxValues,
            "NbrxForecast": futureNbrxValues,
            "TrxHistory": historicalTrxValues,
            "TrxForecast": futureTrxValues,
            "ModelName": modelName,
            "ModelType": modelType,
            "Bounds": bounds,

        };
        // Check if the response array contains an error message
        let statusCode = 200;
        if (Array.isArray(parsedResponse.response)) {
            const containsError = parsedResponse.response.some((responseObj) => {
                try {
                    const parsedItem = JSON.parse(responseObj);
                    // console.log("parsedItem::" + parsedItem);
                    return parsedItem.hasOwnProperty("error");
                } catch (error) {
                    return false; // If parsing fails, assume it's not an error object
                }
            });
            // console.log("containsError::" + containsError);
            if (containsError) {
                throw new Error("An internal server error occurred");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};

const saveNbrxForecast = async (body, idToken) => {
    let forecastResponse = null;
    let response = null;
    try {
        const user = getUserAttributesFromToken(idToken);
        const createdBy = user.email.split("@")[0];
        const {
            createdOn,
            primaryFileName,
            supportingFileName,
            forecastName,
            product,
            modelType,
            outputData,
            isUploadedFromDb,
            bounds,
            ForecastStartDate
        } = body;
        const userAuditDetails = {
            user: user.email,
            action: 'Save NBRx Forecast',
            data: {
                forecastName, product, modelType, ForecastStartDate
            },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        // console.log("outputData:" + JSON.stringify(outputData));
        // const from_month = validateAndNormalizeDate(body.duration.fromMonth);
        // const to_month = validateAndNormalizeDate(body.duration.toMonth);
        const table_name = "nbrx-forecast";
        const params = {
            TableName: table_name, // DynamoDB table name
            Item: {
                email: user.email, // Partition Key
                created_on: createdOn, // Sort Key
                primary_file_name: primaryFileName, // String
                supporting_file_name: supportingFileName, // String
                forecast_name: forecastName, // String
                product: product,
                model_type: modelType,
                created_by: createdBy,
                outputData: outputData,
                is_shared: false,
                isUploadedFromDb: isUploadedFromDb,
                bounds: bounds,
                forecast_start_date: ForecastStartDate
            },
        };

        // Put the item into the DynamoDB table
        const command = new PutCommand(params);
        await client.send(command);
        // console.log("Forecast details saved successfully.");
        return {
            message: "NBRx forecast has been saved successfully",
        };
    } catch (error) {
        console.error("Error saving forecast details:", error);
        response = {
            statusCode: 500,
            body: error.message,
            message: "An error occured while saving the forecast",
        };
        // return response;
    }
    // TODO implement

};

// Create a New Nbrx Forecast
const getForecastModels = async () => {
    try {

        // Make a POST request to the external API endpoint
        const response = await axios.get(process.env.DATAIKU_NBRX_MODELS);
        const responseData = response.data;
        // console.log('responseData' + JSON.stringify(responseData));
        delete responseData.timing;
        delete responseData.apiContext;
        const finalResponse = responseData.response.replace(/\n/g, "");
        const models = convertKeysToCamelCase(JSON.parse(finalResponse));
        return models


    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};



// Pull all the NBRx Forecast for the logged in user
const getNBRxForecasts = async (body, idToken) => {
    try {
        const PAGE_LIMIT = 4;
        const requestData = body;
        const user = getUserAttributesFromToken(idToken);
        let exclusiveStartKey = requestData.exclusiveStartKey;
        let response = [];
        let lastEvaluatedKey;
        let totalRecords = 0;
        const TABLE_NAME = "nbrx-forecast";
        const userAuditDetails = {
            user: user.email,
            action: 'Get all the NBRx forecast',
            data: { exclusiveStartKey },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const queryParams = {
            TableName: TABLE_NAME,
            Limit: PAGE_LIMIT,
            ScanIndexForward: false,
        };
        const totalCountParams = {
            TableName: TABLE_NAME, // Replace 'forecast' with your table name
            Select: 'COUNT', // Retrieve count of items
        };

        queryParams.KeyConditionExpression = "email = :email";
        queryParams.ExpressionAttributeValues = { ":email": user.email };
        totalCountParams.KeyConditionExpression = "email = :email";
        totalCountParams.ExpressionAttributeValues = { ":email": user.email };
        if (exclusiveStartKey && exclusiveStartKey !== 0) {
            queryParams.KeyConditionExpression +=
                " AND created_on < :exclusiveStartKey";
            queryParams.ExpressionAttributeValues[":exclusiveStartKey"] =
                exclusiveStartKey.created_on;
        }
        else {
            const { Count } = await dynamodb.send(
                new QueryCommand(totalCountParams)
            );
            totalRecords = Count;
        }

        const command = new QueryCommand(queryParams);
        const result = await dynamodb.send(command);

        if (result.Items) {
            result.Items.forEach((item) => {
                item.supportingFileName = item.supporting_file_name;
                delete item.supporting_file_name;

                item.createdBy = item.created_by;
                delete item.created_by;

                item.primaryFileName = item.primary_file_name;
                delete item.primary_file_name;

                item.modelType = item.model_type;
                delete item.model_type;

                item.forecastName = item.forecast_name;
                delete item.forecast_name;

                item.isShared = item.is_shared;
                delete item.is_shared;

                item.createdOn = item.created_on;
                delete item.created_on;

                item.ForecastStartDate = item.forecast_start_date;
                delete item.forecast_start_date;
            });
        }
        // console.log("totalRecords"+totalRecords);
        // console.log("result"+JSON.stringify(result));
        // console.log("LastEvaluatedKey"+JSON.stringify(result.LastEvaluatedKey));
        // console.log("Last Item CreatedOn"+result.Items[result.Items.length - 1].createdOn);


        const additionalParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "email = :email AND created_on < :lastEvaluatedKey",
            ExpressionAttributeValues: {
                ":email": user.email,
                ":lastEvaluatedKey": result.Items.length > 0 ? result.Items[result.Items.length - 1].createdOn : 0
            },
            Limit: 1, // Fetch only 1 item to validate the existence
        };

        const additionalResult = await dynamodb.send(new QueryCommand(additionalParams));
        // console.log("additionalResult"+additionalResult.Items.length);
        // lastEvaluatedKey = (totalRecords === PAGE_LIMIT) ||  ? null : result.LastEvaluatedKey;
        // lastEvaluatedKey = result.LastEvaluatedKey ? result.LastEvaluatedKey : null;
        lastEvaluatedKey = additionalResult.Items.length === 0 ? null : result.LastEvaluatedKey;
        response = [...response, ...result.Items];

        return {
            response,
            exclusiveStartKey: lastEvaluatedKey || null,
            totalRecords,

        };
    } catch (error) {
        console.error(
            "Error While retrieving the NBRx forecast details of the logged in user",
            error
        );
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};


// Delete a forecast
const deleteNBRxForecast = async (id, idToken) => {
    let forecastResponse = null;
    let response = null;
    try {
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'Delete a NBRx forecast',
            data: { id },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const TABLE_NAME = "nbrx-forecast";
        const params = {
            TableName: TABLE_NAME, // DynamoDB table name
            Key: {
                email: user.email, // Partition Key
                created_on: id, // Sort Key
            },
        };
        // Put the item into the DynamoDB table
        const command = new DeleteCommand(params);
        const response = await client.send(command);
        // console.log("Forecast deleted successfully:", response);
    } catch (error) {
        console.error("Error deleting Forecast details:", error);
        response = {
            statusCode: 500,
            body: error.message,
            message: "An error occured while deleting the forecast",
        };
        return response;
    }
    // TODO implement
    response = {
        message: "NBRx Forecast has been deleted successfully"
    };
    return response;
};

// Publish a NBRx forecast
const shareNBRxForecast = async (body, idToken) => {
    let forecastResponse = null;
    let response = null;
    const requestData = body;
    try {
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'Share a NBRx forecast',
            data: { id: requestData.id },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const TABLE_NAME = "nbrx-forecast";

        const getParams = {
            TableName: TABLE_NAME, // DynamoDB table name
            Key: {
                email: user.email, // Partition Key
                created_on: requestData.id, // Sort Key
            },
            KeyConditionExpression: "email = :email and created_on = :id",
            ExpressionAttributeValues: { ":email": user.email, ":id": requestData.id },
        };
        const getCommand = new QueryCommand(getParams);
        const foreCastResults = await client.send(getCommand);
        // console.log("foreCastResults" + JSON.stringify(foreCastResults));
        if (foreCastResults.Count <= 0) {
            return {
                statusCode: 404,
                message: "NBRx Forecast with the given id not exists",
            };
        }
        const updateParams = {
            TableName: TABLE_NAME, // DynamoDB table name
            Key: {
                email: user.email, // Partition Key
                created_on: requestData.id // Sort Key
            },
            UpdateExpression: "set is_shared = :val , shared_on = :sharedOn",
            ConditionExpression:
                "attribute_not_exists(is_shared) OR is_shared = :falseVal", // Only update if 'is_shared' is not already true
            ExpressionAttributeValues: {
                ":val": true,
                ":falseVal": false, // Ensure that 'is_shared' is false or doesn't exist before updating
                ":sharedOn": requestData.sharedOn // Timestamp of the forecast that is shared
            },
            ReturnValues: "ALL_NEW",
        };

        const updateCommand = new UpdateCommand(updateParams);
        const result = await client.send(updateCommand);
        // console.log("result" + JSON.stringify(result));
        return {
            statusCode: 200,
            message: "NBRx Forecast shared successfully",
        };
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            // Handle the case where 'is_shared' is already true
            return {
                statusCode: 400,
                message: "The NBRx forecast has already been shared",
            };
        } else {
            console.error("Error updating item:", error);
            return {
                statusCode: 500,
                message: "Error updating item",
                error: error.message,
            };
        }
    }
};

//Un Publish a NBRx forecast
const unShareNBRxForecast = async (id, idToken) => {
    let forecastResponse = null;
    let response = null;

    try {
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'UnShare a NBRx forecast',
            data: { id },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const TABLE_NAME = "nbrx-forecast";
        const getParams = {
            TableName: TABLE_NAME, // DynamoDB table name
            Key: {
                email: user.email, // Partition Key
                created_on: id, // Sort Key
            },
            KeyConditionExpression: "email = :email and created_on = :id",
            ExpressionAttributeValues: { ":email": user.email, ":id": id },
        };
        const getCommand = new QueryCommand(getParams);
        const foreCastResults = await client.send(getCommand);
        if (foreCastResults.Count <= 0) {
            return {
                statusCode: 404,
                message: "NBRx Forecast with the given id not exists",
            };
        }
        const updateParams = {
            TableName: TABLE_NAME, // DynamoDB table name
            Key: {
                email: user.email, // Partition Key
                created_on: id, // Sort Key
            },
            UpdateExpression: "set is_shared = :val, shared_on = :sharedOn",
            ConditionExpression:
                "attribute_not_exists(is_shared) OR is_shared = :falseVal", // Only update if 'is_shared' is not already true
            ExpressionAttributeValues: {
                ":val": false,
                ":falseVal": true, // Ensure that 'is_shared' is true or doesn't exist before updating
                ":sharedOn": '' // Timestamp of the forecast that is shared
            },
            ReturnValues: "UPDATED_NEW",
        };

        const updateCommand = new UpdateCommand(updateParams);
        const result = await client.send(updateCommand);
        // console.log("result" + JSON.stringify(result));
        return {
            statusCode: 200,
            message: "NBRx Forecast unshared successfully",
        };
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            // Handle the case where 'is_shared' is already true
            return {
                statusCode: 400,
                message: "The NBRx forecast has already been unshared",
            };
        } else {
            console.error("Error updating item:", error);
            return {
                statusCode: 500,
                message: "Error updating item",
                error: error.message,
            };
        }
    }
};

// Pull all the NBRx Forecast for the logged in user
const getNBRxSharedForecasts = async (body, idToken) => {
    try {
        const PAGE_LIMIT = 4;
        const requestData = body;
        let exclusiveStartKey = requestData.exclusiveStartKey;
        let response = [];
        let lastEvaluatedKey;
        let finalResult = [];
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'Get all the Shared NBRx forecast',
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const TABLE_NAME = "nbrx-forecast";

        const queryParams = {
            TableName: TABLE_NAME,
            FilterExpression: "is_shared = :shared",
            ExpressionAttributeValues: {
                ":shared": true,
            },
            // Limit: PAGE_LIMIT,
            // ScanIndexForward: false
        };
        // console.log("exclusiveStartKey" + exclusiveStartKey);
        if (exclusiveStartKey == 0) {
            exclusiveStartKey = null;
        }
        const command = new ScanCommand(queryParams);
        const result = await dynamodb.send(command);
        let totalRecords = result.Items.length > 0 ? result.Items.length : 0;
        if (result.Items) {
            result.Items.forEach((item) => {
                item.supportingFileName = item.supporting_file_name;
                delete item.supporting_file_name;

                item.createdBy = item.created_by;
                delete item.created_by;

                item.primaryFileName = item.primary_file_name;
                delete item.primary_file_name;

                item.modelType = item.model_type;
                delete item.model_type;

                item.forecastName = item.forecast_name;
                delete item.forecast_name;

                item.isShared = item.is_shared;
                delete item.is_shared;

                item.createdOn = item.created_on;
                delete item.created_on;
            });

            const sortedItems = result.Items.sort((a, b) => {
                return b.shared_on - a.shared_on; // Assuming 'created_on' is a number (N)
            });
            // console.log("sortedItems" + JSON.stringify(sortedItems));
            // Step 2: If it's the first request (no lastCreatedOn), return the first 'pageSize' items
            if (!exclusiveStartKey) {
                response = sortedItems.slice(0, PAGE_LIMIT);
                lastEvaluatedKey =
                    totalRecords > 0 && totalRecords <= PAGE_LIMIT || response.length == 0
                        ? null
                        : response[PAGE_LIMIT - 1].shared_on;
                return {
                    response,
                    exclusiveStartKey: lastEvaluatedKey || null,
                    totalRecords,

                };
            }

            // Step 3: For subsequent requests, find the index of the lastCreatedOn and return the next 'pageSize' items
            const startIndex = sortedItems.findIndex(
                (item) => item.shared_on === exclusiveStartKey
            );
            if (startIndex !== -1) {
                response = sortedItems.slice(
                    startIndex + 1,
                    startIndex + 1 + PAGE_LIMIT
                );
                // console.log("finalResult" + JSON.stringify(response));
                lastEvaluatedKey =
                    response.length > 0 && response.length <= PAGE_LIMIT
                        ? null
                        : response[response.length - 1].shared_on;
            } else {
                lastEvaluatedKey = null;
                response = []; // If no more items are available
                return {
                    statusCode: 400,
                    message: "No records found for the provided input ",
                };
            }
            return {
                response,
                exclusiveStartKey: lastEvaluatedKey || null,
                totalRecords
            };
        }
    } catch (error) {
        console.error("Error While retrieving the all shared forecast", error);
        return {
            statusCode: 500,
            message: "Error While retrieving the all shared forecast",
        };
    }
};
