export const parseJsonErrorMessage = (error: string) => {
  try {
    const parsedError = JSON.parse(error);

    return `Status: ${parsedError.status} \n Message: ${parsedError.message}`;
  } catch {
    return error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObjectValue = (obj: any, keyString: string) => {
  const keys = keyString.split(".");

  let value = obj;

  for (const key of keys) {
    value = value[key];

    if (value === undefined) {
      return undefined;
    }
  }

  return value;
};

export const getFnKey = (name: string) => {
  switch (name) {
    case "bill":
      return "Bill";
    case "invoice":
      return "Invoice";
    case "purchaseorder":
      return "PurchaseOrder";
    default:
      return `${capitalizeFirstLetter(name)}s`;
  }
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const makeFirstLetterUppercase = (str: string) => {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function createObjectWithoutKeys(
  originalObject: Record<string, string>,
  keysToExclude: string[]
) {
  const newObject: Record<string, string> = {};

  for (const key in originalObject) {
    if (
      !keysToExclude.includes(key) &&
      !(key === "workspace" && originalObject[key] == null)
    ) {
      newObject[key] = originalObject[key];
    }
  }

  return newObject;
}
// for every key with a ., make a new object with the key and value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createNestedObject = (obj: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj[key] === undefined) continue;

    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const subKey = keys[i];
      if (!current[subKey]) {
        if (i === keys.length - 1) {
          current[subKey] = obj[key]; // Assign the final value
        } else {
          current[subKey] = {}; // Create an empty object for nested keys
        }
      }
      current = current[subKey]; // Move to the next level
    }
  }

  return result;
};

export const substitutePlaceholders = (
  string: string,
  obj: Record<string, string>
) => {
  for (const [key, value] of Object.entries(obj)) {
    string = string.replace(new RegExp(`__${key}__`, "g"), value);
  }
  return string;
};

export const getErrorMessage = (error: string) => {
  if (error.includes("Address not found")) {
    return "Email address not found";
  }
  return error;
};
