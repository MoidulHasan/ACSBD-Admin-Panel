import * as yup from "yup";

export const requiredString = (field: string) =>
  yup.string().required(`${field} is required`);
export const requiredNumber = (field: string) =>
  yup.number().required(`${field} is required`);
export const requiredBoolean = (field: string) =>
  yup.boolean().required(`${field} is required`);
