
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { getUserAttributesFromToken, validateAndNormalizeDate } from './authUtils.mjs'
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
export const handler = (event) => {
    const { resourcePath, body, match } = event;
    const token = event.headers.Authorization || null;
    const group = event.headers.Group || null;
    // Restructure the parameters into an object
    const params = {
        body,
        token,
        group,
        match
    };
    let finalResponse = null;
    switch (resourcePath) {
        case '/compare':
            finalResponse = compareToggleForecast(body, token);
            break;
        case '/all-forecast-names':
            finalResponse = getForecastNames(params);
            break;
        case '/compare-forecast':
            finalResponse = compareForecast(body, token);
            break;
        default:
            finalResponse = {
                statusCode: 400,
                body: JSON.stringify({ message: 'Unsupported HTTP method' })
            };
    }
    return finalResponse;
};

// Compare forecast Toggle
const compareToggleForecast = async (body, idToken) => {
    try {

        // Parse the request body sent by API Gateway
        const requestData = body;
        const user = getUserAttributesFromToken(idToken);
        const userAuditDetails = {
            user: user.email,
            action: 'Compare Forecast Toggle Button',
            data: { feature: requestData.vall, supporting_variables: requestData.selected_values },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        // Make a POST request to the external API endpoint
        const response = await axios.post(process.env.DATAIKU_COMPARE_FORECAST, requestData);
        const responseData = JSON.stringify(response.data);
        const parsedResponse = JSON.parse(responseData);

        // Check if the response array contains an error message
        let statusCode = 200;
        if (Array.isArray(parsedResponse.response)) {

            const containsError = parsedResponse.response.some(responseObj => {
                try {
                    const parsedItem = JSON.parse(responseObj);
                    return parsedItem.hasOwnProperty('error');
                } catch (error) {
                    return false; // If parsing fails, assume it's not an error object
                }
            });
            if (containsError) {
                throw new Error('An internal server error occurred');
            }
        }
        const forecastResults = JSON.parse(parsedResponse.response).data;
        const forecastData = forecastResults.map((item) => {
            return { 'MONTH': item[0], 'FORECAST': item[2] }
        })
        return {
            statusCode: 200,
            body: JSON.stringify(forecastData)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
// List all the forecast names created by the user - Compare forecast
const getForecastNames = async (params) => {
    const { body, token, group, match } = params;
    let fromMonth, toMonth;
    try {
        const user = getUserAttributesFromToken(token);

        const requestData = body;
        const userAuditDetails = {
            user: user.email,
            action: 'List all the forecast names',
            data: { match, feature: requestData.featureType },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        if (match === "summary" || match === "compare") {
            fromMonth = validateAndNormalizeDate(requestData.duration.fromMonth);
            toMonth = validateAndNormalizeDate(requestData.duration.toMonth);
        }

        const featureType = requestData.featureType;
        const TABLE_NAME = 'forecast';

        const baseParams = {
            TableName: TABLE_NAME,
            FilterExpression: 'feature_type = :featureTypeValue',
            ExpressionAttributeValues: {
                ':featureTypeValue': featureType
            }
        };

        const commonAttributes = {
            '#duration': 'duration',
            '#fromMonth': 'fromMonth',
            '#toMonth': 'toMonth'
        };

        const addDurationFilters = (params) => {
            params.ExpressionAttributeNames = commonAttributes;
            params.ExpressionAttributeValues[":fromMonth"] = fromMonth;
            params.ExpressionAttributeValues[":toMonth"] = toMonth;
        };

        let command;

        if (match === "compare") {
            if (group === process.env.FINANCE) { // Financial Analyst Role - Compare
                baseParams.KeyConditionExpression = 'email = :email';
                baseParams.ExpressionAttributeValues[":email"] = user.email;
                baseParams.FilterExpression += " AND #duration.#fromMonth = :fromMonth AND #duration.#toMonth = :toMonth";
                addDurationFilters(baseParams);
                command = new QueryCommand(baseParams);
            } else { // Business User Role - Compare
                baseParams.FilterExpression += " AND #duration.#fromMonth = :fromMonth AND #duration.#toMonth = :toMonth";
                addDurationFilters(baseParams);
                command = new ScanCommand(baseParams);
            }
        } else {
            baseParams.KeyConditionExpression = 'email = :email';
            baseParams.ExpressionAttributeValues[":email"] = user.email;

            if (match === "summary") {
                baseParams.FilterExpression += " AND (#duration.#fromMonth >= :fromMonth AND #duration.#toMonth <= :toMonth)";
                addDurationFilters(baseParams);
            }

            command = new QueryCommand(baseParams);
        }

        const result = await dynamodb.send(command);

        if (result.Items.length > 0) {
            const forecast_names = result.Items.map(item => ({
                forecastName: item.forecast_name,
                createdOn: item.created_on,
                email: item.email
            }));

            return {
                statusCode: 200,
                body: forecast_names
            };
        } else {
            return {
                statusCode: 404,
                body: "forecast names not found"
            };
        }
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};

// Compare Forecast Button - Dashboard
const compareForecast = async (body, idToken) => {
    try {
        const user = getUserAttributesFromToken(idToken);
        const requestData = body;
        const userAuditDetails = {
            user: user.email,
            action: 'Compare Forecast Dashboard',
            data: { requestData },
            timestamp: new Date().toISOString()
        };
        console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
        const inputKeys = requestData.map((request, index) => {
            return {
                email: request.email,
                created_on: request.createdOn
            }
        });

        let command, result;
        let response = {};
        const qParams = {
            RequestItems: {
                'forecast': {
                    Keys: inputKeys
                }
            }
        };

        command = new BatchGetCommand(qParams);
        result = await dynamodb.send(command);
        const items = result.Responses ? result.Responses['forecast'] : [];

        if (items.length <= 0) {
            const message = "forecast results not found";
            return {
                statusCode: 404,
                body: message
            };
        }

        // Iterate over the result items
        items.map((item, index) => {
            const created_forecast = `${item.forecast_name}&${item.created_on}`;
            response[created_forecast] = item.apiResponseData;
        });
        // Check if there are any responses

        return {
            statusCode: 200,
            body: response
        };

    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};