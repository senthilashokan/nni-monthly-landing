
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getUserAttributesFromToken, validateAndNormalizeDate } from './authUtils.mjs'
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const handler = (event) => {
  const { resourcePath, body, id } = event;
  const token = event.headers.Authorization || null;
  // console.log('token'+token);
  let finalResponse = null;
  switch (resourcePath) {
    case '/presets':
      finalResponse = createSavePreset(body, token);
      break;
    case '/all-preset':
      finalResponse = getSavePresets(body, token);
      break;
    case '/delete-preset':
      finalResponse = deleteSavePreset(id, token);
      break;
    default:
      finalResponse = {
        statusCode: 400,
        body: JSON.stringify({ message: 'Unsupported HTTP method' })
      };
  }
  return finalResponse;
}
// Create a Save Preset
const createSavePreset = async (body, idToken) => {
  let forecastResponse = null;
  let response = null;
  try {
    const user = getUserAttributesFromToken(idToken);
    const email = user.email;
    const createdBy = email.split('@')[0];
    const { createdOn, primaryFileName, supportingFileName, forecastName, featureType, supportingVariables, sliderValue, df1, df2, isUploadedFromDb, featureListFromDbWithEndDates } = body;
    const from_month = validateAndNormalizeDate(body.duration.fromMonth);
    const to_month = validateAndNormalizeDate(body.duration.toMonth);
    const userAuditDetails = {
      user: email,
      action: 'Create Save Preset',
      data: { forecastName, featureType, supportingVariables },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = 'save-preset';
    const params = {
      TableName: TABLE_NAME, // DynamoDB table name
      Item: {
        email: email, // Partition Key
        created_on: createdOn, // Sort Key
        primary_file_name: primaryFileName, // String
        supporting_file_name: supportingFileName, // String
        forecast_name: forecastName, // String
        feature_type: featureType, // LSI Sort Key
        supporting_variables: supportingVariables, // LSI Sort Key
        created_by: createdBy, // Sort Key
        duration: { // Object with fromMonth and toMonth
          fromMonth: from_month,
          toMonth: to_month
        },
        slider_value: sliderValue,
        df1: df1,
        df2: df2,
        isUploadedFromDb: isUploadedFromDb,
        featureListFromDbWithEndDates: featureListFromDbWithEndDates
      }
    };

    // Put the item into the DynamoDB table
    const command = new PutCommand(params);
    await client.send(command);
    forecastResponse = {
      email: email,
      createdOn: body.createdOn,
      message: "Preset has been saved successfully"
    };
  } catch (error) {
    console.error("Error saving forecast details:", error);
    response = {
      statusCode: 500,
      body: error.message,
      message: "An error occured while saving the forecast"
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

// Pull all the Save Preset for the logged in user
const getSavePresets = async (body, idToken) => {
  try {
    const user = getUserAttributesFromToken(idToken);
    const email = user.email;
    const PAGE_LIMIT = 9;
    const requestData = body;
    let exclusiveStartKey = requestData.exclusiveStartKey;
    let response = [];
    let totalRecords = 0;
    const TABLE_NAME = 'save-preset';
    const userAuditDetails = {
      user: email,
      action: 'Get all Saved Presets',
      data: { exclusiveStartKey },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const totalCountParams = {
      TableName: TABLE_NAME, // Replace 'forecast' with your table name
      KeyConditionExpression: 'email = :email', // Partition key condition
      ExpressionAttributeValues: {
        ':email': email // Provide DynamoDB attribute value object for email
      },
      Select: 'COUNT', // Retrieve count of items
    };

    const queryParams = {
      TableName: TABLE_NAME,
      Limit: PAGE_LIMIT,
      exclusiveStartKey,
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      ScanIndexForward: false,
    };

    if (exclusiveStartKey && exclusiveStartKey !== 0) {
      queryParams.KeyConditionExpression += ' AND created_on < :exclusiveStartKey';
      queryParams.ExpressionAttributeValues[':exclusiveStartKey'] = exclusiveStartKey.created_on;
    } else {
      const { Count } = await dynamodb.send(new QueryCommand(totalCountParams));
      totalRecords = Count;
    }

    const command = new QueryCommand(queryParams);
    const result = await dynamodb.send(command);

    const lastEvaluatedKey = result.LastEvaluatedKey ? result.LastEvaluatedKey : null;
    response = [...response, ...result.Items];

    return {
      statusCode: 200,
      body: {
        response,
        exclusiveStartKey: lastEvaluatedKey || null,
        totalRecords
      }
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }

}

// Delete a Save Preset
const deleteSavePreset = async (id, idToken) => {
  let forecastResponse = null;
  let response = null;
  try {
    const user = getUserAttributesFromToken(idToken);
    const email = user.email;
    const userAuditDetails = {
      user: email,
      action: 'Delete a Saved Preset',
      data: { id },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    const TABLE_NAME = 'save-preset';
    const params = {
      TableName: TABLE_NAME, // DynamoDB table name
      Key: {
        email: email, // Partition Key
        created_on: id, // Sort Key
      }
    };

    // Put the item into the DynamoDB table
    const command = new DeleteCommand(params);
    const response = await client.send(command);
    forecastResponse = {
      email: email,
      createdOn: id,
      message: "Preset has been deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting preset details:", error);
    response = {
      statusCode: 500,
      body: error.message,
      message: "An error occured while deleting the preset"
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