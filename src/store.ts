import {
  actionCreator, EmptyActionDescription, TypedActionDescription,
  reducerFromActions, defineStore, extendWithActions, reassign, reassignif,
} from "rxstore";
import { Validator, ValidationResult, successResult } from "rxvalidation";
import {
  FormState, FormFieldState, FormGroupState, CommonFormState,
  FormFieldDefinition, FormGroupDefinition, FormDefinition,
  CreateFormStoreOptions, FieldValidatorFactory, GroupValidatorFactory,
  FormFieldStateOptions, FormFieldOptions,
  FormGroupStateOptions, FormGroupOptions,
  FormStore, FormGroupChildren, FormFieldStore, FormGroupStore,
} from "./interfaces";
import {
  getGlobalFieldOptions, getFieldTypeOptions, getGlobalGroupOptions, mergeOptions,
} from "./options";
import { assignIfExists } from "./utils";

/* STATE MANIPULATION */

// const createGroupValue = (children: { [name: string]: FormState }): any => {
//   let values: any = {};
//   Object.keys(children)
//     .forEach(key => values[key] = children[key].value);
//   return values;
// };

const createFieldValidatorFactories = (
  validators: Validator[] | undefined,
  validatorFactories: FieldValidatorFactory[] | undefined)
  : FieldValidatorFactory[] => {
  const v1 = validators ? validators.map(v => (s: FormFieldState) => v) : [];
  const v2 = validatorFactories ? validatorFactories : [];
  return v1.concat(v2);
};

const createGroupValidatorFactories = (
  validators: Validator[] | undefined,
  validatorFactories: GroupValidatorFactory[] | undefined)
  : GroupValidatorFactory[] => {
  const v1 = validators ? validators.map(v => (s: FormGroupState) => v) : [];
  const v2 = validatorFactories ? validatorFactories : [];
  return v1.concat(v2);
};

/* DEFAULT STATES */

const defaultCommonState =
  (): CommonFormState => ({
    value: undefined,
    isValid: true,
    isInvalid: false,
    isPending: false,
    pendingCount: 0,
    isDirty: false,
    isPristine: true,
    isTouched: false,
    isUntouched: true,
    hasFocus: false,
    errors: successResult(),
  });

export const defaultFieldState =
  (def: FormFieldDefinition, createOptions?: CreateFormStoreOptions)
    : FormFieldState => {
    const globalOptions = createOptions && createOptions.globalFieldOptions
      ? createOptions.globalFieldOptions
      : getGlobalFieldOptions();
    const typeOptions = createOptions && createOptions.fieldTypeOptions
      ? createOptions.fieldTypeOptions
      : getFieldTypeOptions();

    let defOptions: any = {};
    if (def.options) {
      assignIfExists(defOptions, def.options, "title");
      assignIfExists(defOptions, def.options, "placeholderValue");
      assignIfExists(defOptions, def.options, "initialValue");
      assignIfExists(defOptions, def.options, "isEmpty");
      assignIfExists(defOptions, def.options, "coerce");
      assignIfExists(defOptions, def.options, "compare");
      defOptions.validatorFactories = createFieldValidatorFactories(
        def.options.validators, def.options.validatorFactories
      );
    }

    const options: FormFieldStateOptions = mergeOptions(
      globalOptions,
      typeOptions[def.type],
      defOptions);

    return Object.assign(
      defaultCommonState(), {
        kind: "field" as ("field"),
        type: def.type,
        value: options.initialValue,
        options,
      });
  };

let createFormStoreFunc: (def: FormDefinition,
  createOptions?: CreateFormStoreOptions) => FormStore;

export const defaultGroupState =
  (def: FormGroupDefinition,
    createOptions?: CreateFormStoreOptions)
    : FormGroupState => {
    const globalOptions = createOptions && createOptions.globalGroupOptions
      ? createOptions.globalGroupOptions
      : getGlobalGroupOptions();
    let children: FormGroupChildren = {};
    if (def.properties) {
      Object.keys(def.properties).forEach(
        key => children[key] = createFormStoreFunc(def.properties![key], createOptions),
      );
    }
    let defOptions: any = {};
    if (def.options) {
      assignIfExists(defOptions, def.options, "title");
      defOptions.validatorFactories = createGroupValidatorFactories(
        def.options.validators, def.options.validatorFactories
      );
    }
    const options: FormGroupStateOptions = mergeOptions(
      globalOptions,
      defOptions);

    return Object.assign(defaultCommonState(), {
      kind: "group" as ("group"),
      children,
      value: null,
      options,
    });
  };

/* ACTIONS */

export interface FormStateChange {
  changeValue?: { value: any; };
  changeFocus?: { hasFocus: boolean; isTouched: boolean; };
  changeDirty?: { isDirty: boolean; };
}

const fieldAction = actionCreator<FormFieldState>("RxStore@FORMS@FIELD@");
const groupAction = actionCreator<FormGroupState>("RxStore@FORMS@GROUP@");

const updateStateWithChange =
  <TState extends FormState>
    (state: TState, change: FormStateChange) => {
    let result = state;
    // VALUE
    if (change.changeValue) {
      result = reassign(
        result, {
          value: change.changeValue.value,
        });
    }
    // FOCUS
    if (change.changeFocus) {
      result = reassign(result, {
        hasFocus: change.changeFocus.hasFocus,
        isTouched: change.changeFocus.isTouched,
        isUntouched: !change.changeFocus.isTouched,
      });
    }
    // DIRTY
    if (change.changeDirty) {
      result = reassignif(
        change.changeDirty.isDirty !== state.isDirty,
        result, {
          isDirty: change.changeDirty.isDirty,
          isPristine: !change.changeDirty.isDirty,
        });
    }
    return result;
  };

export const FieldActions = {
  stateChanged: fieldAction.of<FormStateChange>("STATE_CHANGED", updateStateWithChange),

  update: fieldAction.of<any>("UPDATE"),
  blur: fieldAction("BLUR"),
  focus: fieldAction("FOCUS"),
  reset: fieldAction("RESET"),
};

export const GroupActions = {
  stateChanged: groupAction.of<FormStateChange>("STATE_CHANGED"),

  reset: groupAction("RESET"),
};

/* STORE */

const FormsFieldReducer = reducerFromActions(FieldActions);
const FormsGroupReducer = reducerFromActions(GroupActions);

const createFormFieldStore = (
  def: FormFieldDefinition,
  createOptions?: CreateFormStoreOptions
) =>
  defineStore<FormFieldState, FormFieldStore>(
    FormsFieldReducer,
    defaultFieldState(def, createOptions),
    extendWithActions(FieldActions))();

const createFormGroupStore = (
  def: FormGroupDefinition,
  createOptions?: CreateFormStoreOptions
) =>
  defineStore<FormGroupState, FormGroupStore>(
    FormsGroupReducer,
    defaultGroupState(def, createOptions),
    extendWithActions(GroupActions))();

createFormStoreFunc = (def: FormDefinition,
  createOptions?: CreateFormStoreOptions) => {
  if (def.kind === "field") {
    return createFormFieldStore(def, createOptions);
  } else {
    return createFormGroupStore(def, createOptions);
  }
};

export const createFormStore = createFormStoreFunc;
