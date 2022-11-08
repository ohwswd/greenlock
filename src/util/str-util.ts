export const camelCaseToLine = (v: string): string => {
  return v.replace(/([A-Z])/g, "-$1").toLowerCase();
};
export const btoa = (str: string) => {
  return "data:text/octet-stream;base64," + window.btoa(str);
};
