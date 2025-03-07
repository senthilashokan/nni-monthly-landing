// authUtils.js
import { jwtDecode } from 'jwt-decode';

export const getUserAttributesFromToken = (idToken) => {
  if (idToken) {
    const decodedToken = jwtDecode(idToken);
    return {
      email: decodedToken.email,
      group: decodedToken["custom:groups"],
    };
  }
  return {
    email: "tusr@novonordisk.com",
    group: "testgroups@1234",
  };
};
// Method used in the Save Preset , Compare forecast & Save forecast
export const validateAndNormalizeDate = (date) => {
    const match = date.match(/^(\d{4})-(\d{1,2})$/);
    if (!match) {
        throw new Error("Invalid date format. Date must be in yyyy-mm format.");
    }

    // Extract year and month
    const year = match[1];
    let month = match[2];

    // Normalize month to ensure it's always two digits
    if (month.length === 1) {
        month = '0' + month;
    }

    // Return normalized date
    return `${year}-${month}`;
}

// Method used in the Create NBRx forecast
export const convertKeysToCamelCase = (obj) => {
  const camelCase = (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      }).replace(/\s+/g, '');
    };
  
    const newObj = {};
    for (let key in obj) {
      newObj[camelCase(key)] = obj[key];
    }
    return newObj;
}
