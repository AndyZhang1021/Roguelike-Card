export const IsEmptyStr = (str: any) => {
  return !str || str === "";
};

export const IsValidEmailAddress = (address: any) => {
  return address && /\S+@\S+\.\S+/.test(address);
};

export const IsZero = (str: any) => {
  return !str || +str == 0;
};

export const IsNumeric = (str: any, allowEmpty = false) => {
  if (!allowEmpty) return str && /^\d+(\.\d+)?$/.test(str);
  return /^\d+(\.\d+)?$/.test(str);
};

export const IsCurrency = (str: any, allowEmpty = false) => {
  if (!allowEmpty) return !IsEmptyStr(str) && /^\d*\.?\d{0,2}$/.test(str);
  return /^\d*\.?\d{0,2}$/.test(str);
};

export const RemoveSpecialCharacters = (string: string) =>
  string.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");

export const IsNull = (value: any) => value === null || value === undefined;