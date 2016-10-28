import {
  Store, Action, actionCreator, EmptyActionDescription, TypedActionDescription,
} from "rxstore";
import { Validator, ValidationResult } from "rxvalidation";

/* INTERFACES */

export interface FormFieldOptions { }
export interface FormGroupOptions { }
export type FormOptions = FormFieldOptions | FormGroupOptions;

export interface FormFieldDefinition { }
export interface FormGroupDefinition { }
export type FormDefinition = FormFieldDefinition | FormGroupDefinition;

export interface FormFieldStateOptions { }
export interface FormGroupStateOptions { }
export type FormStateOptions = FormFieldStateOptions | FormGroupStateOptions;

export interface FormFieldState { }
export interface FormGroupState { }
export type FormState = FormFieldState | FormGroupState;

export interface FormCommonStore { }
export interface FormFieldStore { }
export interface FormGroupStore { }
export type FormStore = FormFieldStore | FormGroupStore;

export type FormFieldStateOptionsPerType = {
  [type: string]: FormFieldStateOptions;
};

/* FORMS: DEFINITIONS */
export type FieldValidatorFactory = (state: FormFieldState) => Validator;
export type GroupValidatorFactory = (state: FormGroupState) => Validator;

export interface FormFieldOptions {
  title?: string;
  placeholderValue?: any;
  initialValue?: any;
  isEmpty?: (value: any, state: FormFieldState) => boolean;
  coerce?: (value: any, state: FormFieldState) => any;
  compare?: (value: any, oldValue: any, state: FormFieldState) => boolean;
  validators?: Validator[];
  validatorFactories?: FieldValidatorFactory[];
}

export interface FormGroupOptions {
  title?: string;
  validators?: Validator[];
  validatorFactories?: GroupValidatorFactory[];
}

export interface FormFieldOptionsPerType {
  [type: string]: FormFieldOptions;
}

export interface FormFieldDefinition {
  kind: "field";
  type: string;
  options?: FormFieldOptions;
}

export type FormGroupProperties = {
  [name: string]: FormFieldDefinition | FormGroupDefinition
};

export interface FormGroupDefinition {
  kind: "group";
  properties?: FormGroupProperties;
  options?: FormGroupOptions;
}

/* STATE */

export interface FormFieldStateOptions {
  title: string;
  placeholderValue: any;
  initialValue: any;
  isEmpty: (value: any, state: FormFieldState) => boolean;
  coerce: (value: any, state: FormFieldState) => any;
  areEqual: (value: any, oldValue: any, state: FormFieldState) => boolean;
  validatorFactories: FieldValidatorFactory[];
}

export interface FormGroupStateOptions {
  title: string;
  validatorFactories: GroupValidatorFactory[];
}

export interface FormTextFieldStateOptions extends FormFieldStateOptions {
  maxLength?: number;
  multiline: boolean;
}
export interface FormBoolFieldStateOptions extends FormFieldStateOptions {
  threeState: boolean;
}
export interface FormNumericFieldStateOptions extends FormFieldStateOptions {
  minValue?: number;
  maxValue?: number;
  precision: number;
}

export interface CommonFormState {
  // Field or group value
  value: any;
  // Validation and errors
  isValid: boolean;
  isInvalid: boolean;
  errors: ValidationResult;
  // Pending validations
  isPending: boolean;
  pendingCount: number;
  // Field value has changed
  isDirty: boolean;
  isPristine: boolean;
  // Field has been focused or changed
  isTouched: boolean;
  isUntouched: boolean;
  // Field has focus right now
  hasFocus: boolean;
}

export interface FormFieldState extends CommonFormState {
  kind: "field";
  options: FormFieldStateOptions;
  type: string;
}

export interface FormGroupChildren {
  [name: string]: FormStore;
}

export interface FormGroupState extends CommonFormState {
  kind: "group";
  options: FormGroupStateOptions;
  children: FormGroupChildren;
}

/* STORE */

export interface CreateFormStoreOptions {
  fieldTypeOptions?: FormFieldStateOptionsPerType;
  globalFieldOptions?: FormFieldStateOptions;
  globalGroupOptions?: FormGroupStateOptions;
}

export interface FormCommonStore {
  value: any;
  reset(): void;
}

export interface FormFieldStore extends Store<FormFieldState>, FormCommonStore {
  kind: "field";
  update(value: any): void;
  blur(): void;
  focus(): void;
}

export interface FormGroupStore extends Store<FormGroupState>, FormCommonStore {
  kind: "group";
}
