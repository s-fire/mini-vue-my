export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
export const extend = Object.assign;

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue);
}
