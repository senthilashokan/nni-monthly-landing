
import axios from 'axios';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchGetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getUserAttributesFromToken } from './authUtils.mjs'
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
export const handler = async (event) => {

  const { resourcePath, body, id } = event;
  const token = event.headers.Authorization || null;
  const group = event.headers.Group || null;
  let finalResponse = null;
  switch (resourcePath) {
    case '/summary-forecast':
      finalResponse = getSummaryDetails(body, token);
      break;
    case '/approved-budget':
      finalResponse = getApprovedBudget(body, token);
      break;
    case '/saved-features':
      finalResponse = getForecastFeatures(body, token, group);
      break;
    case '/haystack-tables':
      finalResponse = getTablesFromHaystack();
      break;
    case '/haystack-meta-data':
      finalResponse = getMetaDataFromHaystackTables(body);
      break;
    default:
      finalResponse = {
        statusCode: 400,
        body: JSON.stringify({ message: 'Unsupported HTTP method' })
      };
  }
  return finalResponse;
}

// Get Approved Budget Details
const getApprovedBudget = async (body, idToken) => {
  try {

    const requestData = body;
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Get approved budget',
      data: { features: requestData.Selected_account },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    // Make a POST request to the external API endpoint
    const response = await axios.post(process.env.DATAIKU_APPROVED_BUDGET, requestData);
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
    // console.log("statusCode"+statusCode);
    // Return the response data from the external API
    return {
      statusCode: 200,
      body: responseData
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};

// Get Summary Forecast Details
const getSummaryDetails = async (body, idToken) => {
  try {
    const requestData = body;
    const forecastDetails = [];
    const featureTypes = [];
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Get Summary Details',
      data: { requestData },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    for (const featureType in requestData) {
      featureTypes.push(featureType);
      // Check if the value is an array
      if (Array.isArray(requestData[featureType])) {
        const features = requestData[featureType];
        features.forEach((feature, index) => {
          const { forecastName, createdOn } = feature;
          forecastDetails.push({
            email: user.email,
            created_on: createdOn
          });
        });
      }
    }

    let command, result;
    let response = {};
    const qParams = {
      RequestItems: {
        'forecast': {
          Keys: forecastDetails
        }
      }
    };

    command = new BatchGetCommand(qParams);
    result = await dynamodb.send(command);
    // Check if there are any responses
    const items = result.Responses ? result.Responses['forecast'] : [];
    if (items.length <= 0) {
      const message = "forecast Summary results not found";
      return {
        statusCode: 404,
        body: message
      };
    }
    const groupedResponse = {};
    items.forEach((item) => {
      const { feature_type, created_on, forecast_name, apiResponseData } = item;
      // console.log('forecast_name'+forecast_name);

      // Check if featureType exists in groupedResponse
      if (!groupedResponse[feature_type]) {
        groupedResponse[feature_type] = {};
      }
      // console.log(groupedResponse[feature_type][forecast_name&created_on]);
      // Check if createdOn exists in the featureType object
      if (!groupedResponse[feature_type][`${forecast_name}&${created_on}`]) {
        groupedResponse[feature_type][`${forecast_name}&${created_on}`] = [];
      }
      // Push the data into the appropriate array
      groupedResponse[feature_type][`${forecast_name}&${created_on}`].push(apiResponseData);
    });

    return {
      statusCode: 200,
      body: groupedResponse
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};

// Get all saved features of the forecast
const getForecastFeatures = async (body, idToken, group) => {
  try {

    const requestData = body;
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Get all saved features',
      data: { group },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = 'forecast';
    let command;

    const queryParams = {
      TableName: TABLE_NAME
    };

    if (group === process.env.FINANCE) { // Financial Analyst Role - Get user specific feature
      queryParams.KeyConditionExpression = 'email = :email';
      queryParams.ExpressionAttributeValues = {
        ':email': user.email,
      };
      command = new QueryCommand(queryParams);
    }

    if (group === process.env.BUSINESS) { // Financial Analyst Role - Get all features
      command = new ScanCommand(queryParams);
    }

    // const command = new QueryCommand(queryParams);
    const result = await dynamodb.send(command);

    const uniqueItemsSet = new Set();
    const distinctItems = [];
    result.Items.forEach(item => {
      const uniqueFeature = item.feature_type; // Adjust based on your attribute structure
      if (!distinctItems.includes(uniqueFeature)) {
        distinctItems.push(uniqueFeature);
      }
    });

    if (result.Items.length <= 0) {
      return {
        statusCode: 404,
        body: 'No features found for the forecast'
      };
    }
    return {
      statusCode: 200,
      body: {
        savedFeatureNames: distinctItems,
        message: "features has been retrieved successfully"
      }
    };

  } catch (error) {
    console.error('Error While retrieving the forecast details of the logged in user', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};

const getTablesFromHaystack = async () => {

  try {
    const response = await axios.get(process.env.DATAIKU_HAYSTACK_TABLES);
    const responseData = response.data;
    const userAuditDetails = {
      action: 'Get Tables from Haystack',
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    delete responseData.timing;
    delete responseData.apiContext;
    const finalResponse = responseData.response.replace(/\n/g, "");
    return {
      statusCode: 200,
      body: JSON.parse(finalResponse)
    };
  }
  catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      message: error.message
    };
  }
}

const getMetaDataFromHaystackTables = async (body) => {

  try {
    // body.primary_table = "dataiku."+ body.primary_table;
    const requestData = body;
    // console.log('requestData'+JSON.stringify(requestData));
    const userAuditDetails = {
      action: 'Get Meta data from Haystack tables',
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const response = await axios.post(
      process.env.DATAIKU_HAYSTACK_TABLES_METADATA, requestData);
    const responseData = response.data;

    if (Array.isArray(responseData.response)) {
      const containsError = responseData.response.some(responseObj => {
        try {
          const parsedItem = JSON.parse(responseObj);
          return parsedItem.hasOwnProperty('error');
        } catch (error) {
          return false; // If parsing fails, assume it's not an error object
        }
      });
      if (containsError) {
        throw new Error('An error occured while retrieving meta data');
      }
    }
    const finalResponse = responseData.response.replace(/\n/g, "");


    return {
      statusCode: 200,
      body: JSON.parse(finalResponse)
    };
  }
  catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      message: error.message
    };
  }
}
