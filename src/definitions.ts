import {
  FormFieldOptions, FormFieldDefinition, FormGroupProperties,
  FormGroupOptions, FormGroupDefinition,
} from "./interfaces";

export const field = (type: string, options?: FormFieldOptions)
  : FormFieldDefinition => {
  return { kind: "field", type, options };
};

export const group = (
  properties: FormGroupProperties,
  options?: FormGroupOptions)
  : FormGroupDefinition => {
  return { kind: "group", properties, options };
};
