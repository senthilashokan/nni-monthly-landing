
import axios from 'axios';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getUserAttributesFromToken } from './authUtils.mjs';
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
export const handler = (event) => {
    const { resourcePath, body, match } = event;
    const token = event.headers.Authorization || null;
    let finalResponse = null;
    switch (resourcePath) {
        case '/nbrx-compare':
            finalResponse = compareNBRxToggleForecast(body, token);
            break;
        case '/product-forecast-names':
            finalResponse = getAllForecastNames(body, token);
            break;
        case '/nbrx-summary':
            finalResponse = getSummaryForecast(body, token);
            break;
        default:
            finalResponse = {
                statusCode: 400,
                body: JSON.stringify({ message: 'Unsupported HTTP method' })
            };
    }
    return finalResponse;
};

// Compare NBRx forecast Toggle
const compareNBRxToggleForecast = async (body, idToken) => {
    try {
        const requestData = body;
        // console.log("requestData::" + JSON.stringify(requestData));
        // Make a POST request to the external API endpoint
        const response = await axios.post(process.env.NBRX_COMPARE_FORECAST, requestData);
        const responseData = JSON.stringify(response.data);
        const parsedResponse = JSON.parse(responseData);
        // console.log("responseData::" + responseData);
        // console.log("parsedResponse::" + JSON.stringify(parsedResponse));
        // console.log("Response::" + parsedResponse.response);
        const finalResponse = JSON.parse(parsedResponse.response);
        // console.log("finalResponse::" + finalResponse);
        // Extracting the forecast start date
        const forecastStartDate = finalResponse["Forecast Start Date"];
        const modelName = finalResponse["Model Name"];
        const bounds = finalResponse["Bounds"];
        const modelType = finalResponse["Model Type"];
        //  console.log("forecastStartDate"+forecastStartDate);
        // Extracting the result data
        const resultData = JSON.parse(finalResponse.result);
        //  console.log("resultData:", resultData);
        // Extracting columns and data
        const columns = resultData.columns;
        const data = resultData.data;

        // Extracting dates and values for nbrx and trx
        const dates = data.map(entry => entry[0]);
        const nbrxValues = data.map(entry => entry[1]);
        const historicalNbrxValues = nbrxValues.filter((value, index) => new Date(dates[index]) < new Date(forecastStartDate));
        const futureNbrxValues = nbrxValues.filter((value, index) => new Date(dates[index]) >= new Date(forecastStartDate));

        // Creating the final formatted response
        return {
            "NbrxForecast": futureNbrxValues,
            "NbrxHistory": historicalNbrxValues,
            "ModelName": modelName,
            "ModelType": modelType,
            "Bounds": bounds
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

// List all the products and relevant forecast names created by the user - Compare forecast
const getAllForecastNames = async (body, idToken) => {
    let command;
    try {
        const user = getUserAttributesFromToken(idToken);
        const queryParams = {
            TableName: 'nbrx-forecast',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': user.email // Replace with the actual email value
            }
        };


        command = new QueryCommand(queryParams);
        const result = await dynamodb.send(command);
        const response = {};
        if (result.Items.length <= 0) {
            return response;
        }

        result.Items.forEach(item => {
            if (!response[item.product]) {
                response[item.product] = [];
            }
            response[item.product].push({
                forecastName: item.forecast_name,
                createdOn: item.created_on,
                email: item.email,
                supprtingFileName: item.supporting_file_name,
                createdBy: item.created_by,
                primaryFileName: item.primary_file_name,
                modelType: item.model_type,
                isShared: item.is_shared,
                ForecastStartDate: item.forecast_start_date,
                outputData: item.outputData,
                bounds: item.bounds,
                product: item.product,
                isUploadedFromDb: item.isUploadedFromDb
            });
        });

        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// List all the products and relevant forecast names created by the user - Summary forecast
// This method returns the 
const getSummaryForecast = async (body, idToken) => {
    let command;
    try {
        const user = getUserAttributesFromToken(idToken);
        const queryParams = {
            TableName: 'nbrx-forecast',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': user.email // Replace with the actual email value
            }
        };


        command = new QueryCommand(queryParams);
        const result = await dynamodb.send(command);
        const response = {};
        if (result.Items.length <= 0) {
            return response;
        }

        // Get the current year and next year
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        const totalReords = result.Items.length;

        result.Items.forEach(item => {
            if (!response[item.product]) {
                response[item.product] = [];
            }
            response[item.product].push({
                modelName: item.model_type,
                forecastName: item.forecast_name,
                bounds: item.bounds,
                currentYearIndex: item.outputData.Date.map((_, index) => index)
                    .filter(index => {
                        const strDate = item.outputData.Date[index];
                        const year = new Date(strDate).getFullYear();
                        if (year === currentYear && new Date(strDate) < new Date(item.outputData.ForecastStartDate)) {
                            return index;
                        }
                    }),
                nbrxHistory: item.outputData.NbrxHistory.length > 0 ? item.outputData.NbrxHistory : 0,
                trxHistory: item.outputData.TrxHistory.length > 0 ? item.outputData.TrxHistory : 0,
                trxForecast: item.outputData.TrxForecast.length > 0 ? item.outputData.TrxForecast : 0,
                // finalTrxDate: item.outputData.Date[totalReords - 1],
                nbrxForecast: item.outputData.NbrxForecast.length > 0 ? item.outputData.NbrxForecast : 0,
                date: item.outputData.Date.filter(currentDate => {
                    return new Date(currentDate) >= new Date(item.outputData.ForecastStartDate)
                }),
                createdOn: item.created_on,
                modelType: item.outputData.ModelType

            });
        });
        // console.log('response'+JSON.stringify(response));
        // return response

        // Initialize the result object
        const finalResult = {};
        // Iterate through each key dynamically
        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                finalResult[key] = response[key].map(item => {
                    const currentYearAfterData = [];
                    const currentYearBeforeData = [];
                    const nextYearData = [];
                    let currentYearNbrxForecast = 0;
                    let nextYearNbrxForecast = 0;
                    let currentYearTrxForecast = 0;
                    let nextYearTrxForecast = 0;
                    let currentYearAfterNbrxForecast = 0;
                    let currentYearAfterTrxForecast = 0;
                    let currentYearBeforeNbrxForecast = 0;
                    let currentYearBeforeTrxForecast = 0;
                    for (let totalAfterForcastDate = 0; totalAfterForcastDate < item.date.length - 1; totalAfterForcastDate++) {
                        const year = new Date(item.date[totalAfterForcastDate]).getFullYear();
                        if (year === currentYear) {
                            currentYearAfterData.push({
                                trxForecast: item.trxForecast[totalAfterForcastDate],
                                nbrxForecast: item.nbrxForecast[totalAfterForcastDate]
                            });
                        } else if (year === nextYear) {
                            nextYearData.push({
                                trxForecast: item.trxForecast[totalAfterForcastDate],
                                nbrxForecast: item.nbrxForecast[totalAfterForcastDate]
                            });
                        }
                    }

                    for (let totalBeforeForcastDate = 0; totalBeforeForcastDate < item.currentYearIndex.length - 1; totalBeforeForcastDate++) {
                        // console.log('trxCurrentHistory'+item.trxHistory[item.currentYearIndex[totalBeforeForcastDate]]);
                        // console.log('nbrxCurrentHistory'+item.nbrxHistory[item.currentYearIndex[totalBeforeForcastDate]]);
                        currentYearBeforeData.push({
                            trxCurrentHistory: item.trxHistory[item.currentYearIndex[totalBeforeForcastDate]],
                            nbrxCurrentHistory: item.nbrxHistory[item.currentYearIndex[totalBeforeForcastDate]]
                        });
                    }

                    currentYearAfterNbrxForecast = currentYearAfterData.reduce((sum, data) => sum + data.nbrxForecast, 0);
                    nextYearNbrxForecast = nextYearData.reduce((sum, data) => sum + data.nbrxForecast, 0);
                    currentYearAfterTrxForecast = currentYearAfterData.reduce((sum, data) => sum + data.trxForecast, 0);
                    nextYearTrxForecast = nextYearData.reduce((sum, data) => sum + data.trxForecast, 0);
                    currentYearBeforeNbrxForecast = currentYearBeforeData.reduce((sum, data) => sum + data.nbrxCurrentHistory, 0);
                    currentYearBeforeTrxForecast = currentYearBeforeData.reduce((sum, data) => sum + data.trxCurrentHistory, 0);
                    currentYearTrxForecast = currentYearBeforeTrxForecast + currentYearAfterTrxForecast;
                    currentYearNbrxForecast = currentYearBeforeNbrxForecast + currentYearAfterNbrxForecast;
                    // console.log('currentYearTrxForecast'+currentYearTrxForecast);
                    // console.log('currentYearNbrxForecast'+currentYearNbrxForecast);
                    return {
                        modelName: item.modelName,
                        createdOn: item.createdOn,
                        forecastName: item.forecastName,
                        bounds: item.bounds,
                        modelType: item.modelType,
                        isSelected: false,
                        currentYearNbrxForecast: currentYearNbrxForecast.toFixed(2).toLocaleString(),
                        nextYearNbrxForecast: nextYearNbrxForecast.toFixed(2).toLocaleString(),
                        currentYearTrxForecast: currentYearTrxForecast.toFixed(2).toLocaleString(),
                        nextYearTrxForecast: nextYearTrxForecast.toFixed(2).toLocaleString()
                    };
                });
            }
        }
        // console.log(finalResult);
        return finalResult;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};