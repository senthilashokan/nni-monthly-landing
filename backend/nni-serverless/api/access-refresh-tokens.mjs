import axios from "axios";
import qs from "qs";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
export const handler = async (event) => {
  const { resourcePath, code, refresh_token, redirectUrl } = event;

  let finalResponse = null;
  switch (resourcePath) {
    case "/get-user-tokens":
      finalResponse = getAccessToken(code, redirectUrl);
      break;
    case "/refresh-tokens":
      finalResponse = getRefreshToken(refresh_token);
      break;
    default:
      finalResponse = {
        statusCode: 400,
        body: JSON.stringify({ message: "Unsupported HTTP method" }),
      };
  }
  return finalResponse;
};

const getAccessToken = async (authCode, redirect_uri) => {
  //Get Client Id and Client Secret from secrets manager Starts
  const client = new SecretsManagerClient({
    region: "us-east-1",
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: "nni-finance-monthly-secrets",
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  const secret = JSON.parse(response.SecretString);

  //Get Client Id and Client Secret from secrets manager Ends
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", secret.client_id);
  params.append("client_secret", secret.client_secret);
  params.append("code", authCode);
  params.append("redirect_uri", redirect_uri);


  const tokenEndpoint = process.env.TOKEN_ENDPOINT_API;


  const clientId = secret.client_id;
  const clientSecret = secret.client_secret;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    // 'Authorization': 'Basic N3BscTIxcjVuamJvaTVqamVwdmVoZmxha3Y6a3U3bTE1bGltZnJrdThlZDNwamNxa2RuY25yamg1ZWl1bjdobWtxc2tqdnBsZHNzNG81'
  };

  try {
    const response = await axios.post(tokenEndpoint, qs.stringify({}), {
      headers,
      params,
    });
    console.log("Token response:", response.data);
    const userAuditDetails = {
      action: 'User Authenticated',
      data: { response: response.data },
      timestamp: new Date().toISOString()
    };
    console.log("UserAuditDetails:" + JSON.stringify(userAuditDetails));
    return {
      statusCode: 200,
      body: response.data,
    };
  } catch (error) {
    console.error("Error:", error.response);

    return {
      statusCode: error.response ? error.response.status : 500,
      body: error.response.data.error,
    };
  }
};

const getRefreshToken = async (refresh_token) => {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);
  const tokenEndpoint = process.env.TOKEN_ENDPOINT_API;
  //Get Client Id and Client Secret from secrets manager Starts
  const client = new SecretsManagerClient({
    region: "us-east-1",
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: "nni-finance-monthly-secrets",
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
  const secret = JSON.parse(response.SecretString);
  //Get Client Id and Client Secret from secrets manager Ends
  const clientId = secret.client_id;
  const clientSecret = secret.client_secret;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
  };

  try {
    const response = await axios.post(tokenEndpoint, qs.stringify({}), {
      headers,
      params,
    });


    return {
      statusCode: 200,
      body: response.data,
    };
  } catch (error) {
    console.error("Error:", error.message);

    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
