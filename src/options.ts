import "object-assign";
const objectAssign = require("object-assign");
import {
  FormFieldStateOptions, FormGroupStateOptions, FormTextFieldStateOptions,
  FormBoolFieldStateOptions, FormFieldStateOptionsPerType, FormFieldState,
} from "./interfaces";
import { flatten } from "./utils";

export const mergeOptions = (...options: ({ validatorFactories: any[] })[]) => {
  let result = objectAssign({}, ...options);
  let validatorFactories = flatten(options
    .filter(o => !!o)
    .map(o => o.validatorFactories)
    .filter(f => !!f), false);
  result.validatorFactories = validatorFactories;
  return result;
};

const isEmpty = (value: any) => !value;
const coerce = (value: any) => value;
const areEqual = (value: any, oldValue: any) => value === oldValue;
const textCoerce = (value: any): any => !value ? "" :
  (typeof value === "string" ? value : String(value).valueOf());
const boolCoerce = (value: any, state: FormFieldState): any => !!value;

const globalFieldStateOptions = {
  title: "",
  placeholderValue: null,
  initialValue: null,
  isEmpty,
  coerce,
  areEqual,
  validatorFactories: [],
} as FormFieldStateOptions;

const globalGroupStateOptions = {
  title: "",
  validatorFactories: [],
} as FormGroupStateOptions;

export const getDefaultTextOptions = (): FormTextFieldStateOptions =>
  objectAssign({}, globalFieldStateOptions, {
    placeholderValue: "",
    initialValue: "",
    coerce: textCoerce,
    multiline: false,
  });

export const getDefaultBoolOptions = (): FormBoolFieldStateOptions =>
  objectAssign({}, globalFieldStateOptions, {
    placeholderValue: "",
    initialValue: false,
    coerce: boolCoerce,
    threeState: false,
  });

export const getGlobalFieldOptions = (): FormFieldStateOptions =>
  objectAssign({}, globalFieldStateOptions);

export const getGlobalGroupOptions = (): FormGroupStateOptions =>
  objectAssign({}, globalGroupStateOptions);

export const getFieldTypeOptions = (): FormFieldStateOptionsPerType =>
  ({
    text: getDefaultTextOptions(),
    bool: getDefaultBoolOptions(),
  });
