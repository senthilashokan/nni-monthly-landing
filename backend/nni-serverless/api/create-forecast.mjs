import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getUserAttributesFromToken, validateAndNormalizeDate } from './authUtils.mjs'
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
export const handler = (event) => {
  const { resourcePath, body, id } = event;
  const token = event.headers.Authorization || null;
  const group = event.headers.Group || null;
  let finalResponse = null;
  
  switch (resourcePath) {
    case "/forecast":
      finalResponse = createNewForecast(body, token);
      break;
    case "/save":
      finalResponse = saveForecast(body, token);
      break;
    case "/all-forecast":
      finalResponse = getAllForecasts(body, token, group);
      break;
    case "/delete-forecast":
      finalResponse = deleteForecast(id, token);
      break;
    case "/share-forecast":
      finalResponse = shareForecast(body, token);
      break;
    case "/unshare-forecast":
      finalResponse = unShareForecast(id, token);
      break;
    case "/all-shared-forecast":
      finalResponse = getSharedForecasts(body, token);
      break;
    default:
      finalResponse = getSupportingVariables(event, token);
  }
  return finalResponse;
};

// Create a New Forecast
const createNewForecast = async (body, idToken) => {
  try {
    const requestData = body;
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Create a Forecast',
       data: {   feature : requestData.vall,
                 supporting_variables : requestData.selected_values 
             },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    // Make a POST request to the external API endpoint
    const response = await axios.post(
      process.env.DATAIKU_CREATE_FORECAST,
      requestData
    );
    const responseData = JSON.stringify(response.data);
    const parsedResponse = JSON.parse(responseData);
    // console.log("parsedResponse::" + parsedResponse);
    // console.log("responseData::" + responseData);
    // Check if the response array contains an error message
    let statusCode = 200;
    if (Array.isArray(parsedResponse.response)) {
      const containsError = parsedResponse.response.some((responseObj) => {
        try {
          const parsedItem = JSON.parse(responseObj);
          return parsedItem.hasOwnProperty("error");
        } catch (error) {
          return false; // If parsing fails, assume it's not an error object
        }
      });
      if (containsError) {
        throw new Error("An internal server error occurred");
      }
    }
    // Return the response data from the external API
    return {
      statusCode: 200,
      body: responseData,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// Create a Save a forecast
const saveForecast = async (body, idToken) => {
  let forecastResponse = null;
  let response = null;
  try {
    const user = getUserAttributesFromToken(idToken);
    const createdBy = user.email.split("@")[0];
    // console.log('email'+user.email);
    // console.log('group'+user.group);
    const {
      createdOn,
      primaryFileName,
      supportingFileName,
      forecastName,
      featureType,
      supportingVariables,
      apiResponseData,
      isUploadedFromDb
    } = body;
    const userAuditDetails = {
      user: user.email,
      action: 'Save Forecast',
       data: {   forecastName, featureType, supportingVariables 
             },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const from_month = validateAndNormalizeDate(body.duration.fromMonth);
    const to_month = validateAndNormalizeDate(body.duration.toMonth);
    const table_name = "forecast";
    const params = {
      TableName: table_name, // DynamoDB table name
      Item: {
        email: user.email, // Partition Key
        created_on: createdOn, // Sort Key
        primary_file_name: primaryFileName, // String
        supporting_file_name: supportingFileName, // String
        forecast_name: forecastName, // String
        feature_type: featureType, // LSI Sort Key
        supporting_variables: supportingVariables, // LSI Sort Key
        duration: {
          // Object with fromMonth and toMonth
          fromMonth: from_month,
          toMonth: to_month,
        },
        created_by: createdBy,
        apiResponseData: apiResponseData,
        is_shared: false,
        isUploadedFromDb: isUploadedFromDb
      },
    };

    // Put the item into the DynamoDB table
    const command = new PutCommand(params);
    await client.send(command);
    // console.log("Forecast details saved successfully.");
    forecastResponse = {
      email: user.email,
      createdOn: body.createdOn,
      message: "forecast has been saved successfully",
    };
  } catch (error) {
    console.error("Error saving forecast details:", error);
    response = {
      statusCode: 500,
      body: error.message,
      message: "An error occured while saving the forecast",
    };
    return response;
  }
  // TODO implement
  response = {
    statusCode: 200,
    body: forecastResponse,
  };
  return response;
};

// Get the list of supporting variables for feature.
const getSupportingVariables = async (event, idToken) => {
  const TABLE_NAME = "supporting-variables";
  try {
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Get the supporting variables for feature',
       data: {   feature :  event.params.path.feature
             },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const feature = event.params.path.feature; // assuming the feature name is passed as a path parameter
    const params = {
      TableName: TABLE_NAME, // Replace with your DynamoDB table name
      KeyConditionExpression: "feature = :id",
      ExpressionAttributeValues: {
        ":id": feature,
      },
    };
    const allParams = {
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const { Items } = await dynamodb.send(command);
    const supporting_variables = {};
    if (Items.length === 0) {
      // Your DynamoDB table name
      const tableName = "supporting-variables";

      // Attribute name for which you want distinct values
      const attributeName = "supporting-variables";
      // No supporting variables found for the feature, return 404 response
      const distinctItems = await getDistinctSupportingVariables(allParams);
      distinctItems.forEach((item) => {
        supporting_variables[item["supporting-variables"]] = item.description;
      });
      const response = {
        statusCode: 200,
        body: JSON.stringify(supporting_variables),
      };
    }

    Items.forEach((item) => {
      supporting_variables[item["supporting-variables"]] = item.description;
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify(supporting_variables),
    };
    return response;
  } catch (err) {
    console.error("Error while fetching supporting variables data:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Pull all the Forecast for the logged in user
const getAllForecasts = async (body, idToken, group) => {
  try {
    const PAGE_LIMIT = 4;
    const requestData = body;
    const user = getUserAttributesFromToken(idToken);
    let exclusiveStartKey = requestData.exclusiveStartKey;
    let response = [];
    let lastEvaluatedKey;
    let totalRecords = 0;
    const TABLE_NAME = "forecast";

    const businessQueryParams = {
      TableName: TABLE_NAME,
      // Limit: PAGE_LIMIT,
      // ScanIndexForward: false,
    };

    const financeQueryParams = {
      TableName: TABLE_NAME,
      Limit: PAGE_LIMIT,
      ScanIndexForward: false,
    };

    const totalCountParams = {
      TableName: TABLE_NAME,
      Select: "COUNT",
    };
    
    const userAuditDetails = {
      user: user.email,
      action: 'Get all the forecast',
      data: {   group },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    if (group === process.env.FINANCE) {
      // Financial Analyst Role
      financeQueryParams.KeyConditionExpression = "email = :email";
      financeQueryParams.ExpressionAttributeValues = { ":email": user.email };
      totalCountParams.KeyConditionExpression = "email = :email";
      totalCountParams.ExpressionAttributeValues = { ":email": user.email };

      if (exclusiveStartKey && exclusiveStartKey !== 0) {
        financeQueryParams.KeyConditionExpression +=
          " AND created_on < :exclusiveStartKey";
          financeQueryParams.ExpressionAttributeValues[":exclusiveStartKey"] =
          exclusiveStartKey.created_on;
      } else {
        const { Count } = await dynamodb.send(
          new QueryCommand(totalCountParams)
        );
        totalRecords = Count;
      }
    } 
    
    // if (group === "BUSINESS")  {
    //   // Business User Role
    //   // if (exclusiveStartKey) {
    //   //   queryParams.ExclusiveStartKey = exclusiveStartKey;
    //   // }
    //   if (exclusiveStartKey == 0) {
    //     const { Count } = await dynamodb.send(
    //       new ScanCommand(totalCountParams)
    //     );
    //     totalRecords = Count;
    //   }
    // }
    
     if (group === process.env.NBRX) {
        return {
          statusCode: 500,
          message: "Forecast not exists for Group"
       };
     }

    const command =
      group === process.env.FINANCE
        ? new QueryCommand(financeQueryParams)
        :  group === process.env.BUSINESS ? new ScanCommand(businessQueryParams) : null;
    const result = await dynamodb.send(command);
    totalRecords = result.Items.length > 0 ? result.Items.length : 0;
    if (result.Items) {
      result.Items.forEach((item) => {
        if (item.apiResponseData) {
          item.apiResponseData = item.apiResponseData.map((apiResponse) => ({
            MONTH: apiResponse["MONTH"],
            ACTUAL: apiResponse["ACTUAL"],
            FORECAST: apiResponse["FORECAST"],
          }));
        }
      });
    }
    if (group === process.env.BUSINESS)  {
      if(exclusiveStartKey === 0){
        exclusiveStartKey = null;
      }
      const sortedItems = result.Items.sort((a, b) => {
        return b.created_on - a.created_on; // Assuming 'created_on' is a number (N)
      });
      // console.log("sortedItems" + JSON.stringify(sortedItems));
      // Step 2: If it's the first request (no lastCreatedOn), return the first 'pageSize' items
      if (!exclusiveStartKey) {
        response = sortedItems.slice(0, PAGE_LIMIT);
        lastEvaluatedKey =
          totalRecords > 0 && totalRecords <= PAGE_LIMIT || response.length == 0
            ? null
            : response[PAGE_LIMIT - 1].created_on;
          // response = [...response, ...result.Items];
        lastEvaluatedKey = lastEvaluatedKey ? {email : response[PAGE_LIMIT - 1].email, created_on : lastEvaluatedKey} : null;
        return {
            response,
            exclusiveStartKey: lastEvaluatedKey || null,
            totalRecords,
        };
      }
      // console.log("exclusiveStartKey" + exclusiveStartKey);
      // Step 3: For subsequent requests, find the index of the lastCreatedOn and return the next 'pageSize' items
      const startIndex = sortedItems.findIndex(
        (item) => item.created_on === exclusiveStartKey.created_on
      );
      // console.log("startIndex" + startIndex);
      if (startIndex !== -1) {
        response = sortedItems.slice(
          startIndex + 1,
          startIndex + 1 + PAGE_LIMIT
        );
       
        // console.log("finalResult" + JSON.stringify(response));
        // console.log("created_on" + response[response.length - 1].created_on);
        lastEvaluatedKey =
          response.length > 0 && sortedItems.some(item => item.created_on < response[response.length - 1].created_on)
            ? response[response.length - 1].created_on
            : null;
      } else {
        lastEvaluatedKey = null;
        response = []; // If no more items are available
        return {
          statusCode: 400,
          message: "No records found for the provided input ",
        };
      }
      lastEvaluatedKey = lastEvaluatedKey ? {email : response[response.length - 1].email, created_on : lastEvaluatedKey} : null;
      return {
          response,
          exclusiveStartKey: lastEvaluatedKey || null,
          totalRecords,
      };
    }
    // console.log("totalRecords"+totalRecords);
    // console.log("result"+JSON.stringify(result));
    // console.log("LastEvaluatedKey"+JSON.stringify(result.LastEvaluatedKey));
    if (group === "FINANCE")  {
      lastEvaluatedKey = result.LastEvaluatedKey ? result.LastEvaluatedKey : null;
    }
    response = [...response, ...result.Items];
    return {
        response,
        exclusiveStartKey: lastEvaluatedKey || null,
        totalRecords,
     };
  } catch (error) {
    console.error(
      "Error While retrieving the forecast details of the logged in user",
      error
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

// Delete a forecast
const deleteForecast = async (id, idToken) => {
  let forecastResponse = null;
  let response = null;
  try {
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Delete a forecast',
      data: {   id  },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = "forecast";
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
    forecastResponse = {
      email: user.email,
      createdOn: id,
      message: "Forecast has been deleted successfully",
    };
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
    statusCode: 200,
    body: forecastResponse,
  };
  return response;
};

// Publish a forecast
const shareForecast = async (body, idToken) => {
  let forecastResponse = null;
  let response = null;
  const requestData = body;
  try {
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Share a forecast',
      data: {   id : requestData.id  },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = "forecast";

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
        message: "Forecast with the given id not exists",
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
      message: "Forecast shared successfully",
    };
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      // Handle the case where 'is_shared' is already true
      return {
        statusCode: 400,
        message: "The forecast has already been shared",
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

//Un Publish a forecast
const unShareForecast = async (id, idToken) => {
  let forecastResponse = null;
  let response = null;

  try {
    const user = getUserAttributesFromToken(idToken);
    const userAuditDetails = {
      user: user.email,
      action: 'Un Share a forecast',
      data: {   id   },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = "forecast";
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
        message: "Forecast with the given id not exists",
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
      message: "Forecast unshared successfully",
    };
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      // Handle the case where 'is_shared' is already true
      return {
        statusCode: 400,
        message: "The forecast has already been unshared",
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

async function getDistinctSupportingVariables(params) {
  try {
    // console.log("params" + JSON.stringify(params));
    // Perform the scan operation
    const data = await dynamodb.send(new ScanCommand(params));
    const allSupportingVariables = new Set();
    const attribute_name = "supporting-variables";
    // Extract and store distinct values using a Set
    return data.Items.filter((item) => {
      const value = item[attribute_name];
      if (allSupportingVariables.has(value)) {
        // If it is, this item is a duplicate, so return false
        return false;
      } else {
        // If not, add the value to the Set and keep this item
        allSupportingVariables.add(value);
        return true;
      }
    });
  } catch (err) {
    console.error("Error scanning DynamoDB:", err);
    throw err;
  }
}

// Pull all the Forecast for the logged in user
const getSharedForecasts = async (body, idToken) => {
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
      action: 'Get all the Shared forecast',
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = "forecast";

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
    // console.log("Items" + JSON.stringify(result.Items));
    let totalRecords = result.Items.length > 0 ? result.Items.length : 0;
    if (result.Items) {
      result.Items
        .forEach(item => {
          if (item.apiResponseData) {
            item.apiResponseData = item.apiResponseData.map(apiResponse => ({
              "MONTH": apiResponse["MONTH"],
              "ACTUAL": apiResponse["ACTUAL"],
              "FORECAST": apiResponse["FORECAST"]
            }));
          }
        })

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
          statusCode: 200,
          body: {
            response,
            exclusiveStartKey: lastEvaluatedKey || null,
            totalRecords,
          },
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
        statusCode: 200,
        body: {
          response,
          exclusiveStartKey: lastEvaluatedKey || null,
          totalRecords,
        },
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
