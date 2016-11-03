import { Observable } from "rxjs/Observable";
// import "rxjs/add/observable/concat";
import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
// import "rxjs/add/operator/catch";
// import "rxjs/add/operator/concat";
// import "rxjs/add/operator/delay";
import "rxjs/add/operator/distinctUntilChanged";
// import "rxjs/add/operator/do";
// import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
// import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
// import "rxjs/add/operator/observeOn";
// import "rxjs/add/operator/skip";
// import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/switchMap";
// import "rxjs/add/operator/takeLast";
// import "rxjs/add/operator/takeUntil";
// import "rxjs/add/operator/timeout";
// import "rxjs/add/operator/toPromise";
import {
  actionCreator, EmptyActionDescription, TypedActionDescription,
  reducerFromActions, defineStore, extendWithActions, extendWith,
  withEffects, withEffectsOn,
  reassign, reassignif,
  StateUpdate, ICreateStoreOptions, Action,
} from "rxstore";
import { Validator, ValidationResult, successResult } from "rxvalidation";
import {
  FormState, FormFieldState, FormGroupState, CommonFormState,
  FormFieldDefinition, FormGroupDefinition, FormDefinition,
  CreateFormStoreOptions, FieldValidatorFactory, GroupValidatorFactory,
  FormFieldStateOptions, FormFieldOptions, FormCommonStore,
  FormGroupStateOptions, FormGroupOptions,
  FormStore, FormGroupChildren, FormFieldStore, FormGroupStore,
} from "./interfaces";
import {
  getGlobalFieldOptions, getFieldTypeOptions, getGlobalGroupOptions, mergeOptions,
} from "./options";
import { assignIfExists } from "./utils";

/* STATE MANIPULATION */

const createGroupValue = (children: { [name: string]: FormStore }): any => {
  let values: any = {};
  Object.keys(children)
    .forEach(key => values[key] = children[key].value);
  return values;
};

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

let createFormStoreFunc: (
  def: FormDefinition,
  createOptions?: CreateFormStoreOptions,
  storeOptions?: ICreateStoreOptions<CommonFormState>,
) => FormStore;

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
      value: createGroupValue(children),
      options,
    });
  };

/* ACTIONS */

export interface FormStateChange {
  reason?: string;
  changeValue?: { value: any; };
  changeFocus?: { hasFocus: boolean; isTouched: boolean; };
  // changeDirty?: { isDirty: boolean; };
}

const fieldAction = actionCreator<FormFieldState>("RxStore@FORMS@FIELD@");
const groupAction = actionCreator<FormGroupState>("RxStore@FORMS@GROUP@");

const reduceOnStateChanged =
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
    return result;
  };

const reduceOnSetDirty =
  <TState extends FormState>
    (state: TState, isDirty: boolean) =>
    reassignif(state.isDirty !== isDirty, state, { isDirty, isPristine: !isDirty });

export const FieldActions = {
  stateChanged: fieldAction.of<FormStateChange>("STATE_CHANGED", reduceOnStateChanged),
  setDirty: fieldAction.of<boolean>("SET_DIRTY", reduceOnSetDirty),

  update: fieldAction.of<any>("UPDATE"),
  blur: fieldAction("BLUR"),
  focus: fieldAction("FOCUS"),
  reset: fieldAction("RESET"),
};

export const GroupActions = {
  stateChanged: groupAction.of<FormStateChange>("STATE_CHANGED", reduceOnStateChanged),
  setDirty: groupAction.of<boolean>("SET_DIRTY", reduceOnSetDirty),

  reset: groupAction("RESET"),
};

/* FOCUS EFFECTS */

const onFocusWhileBlurred = (store: FormFieldStore) =>
  store.update$
    .filter(u => FieldActions.focus.isA(u.action))
    .filter(u => !u.state.hasFocus)
    .map(u => FieldActions.stateChanged({
      reason: "focus",
      changeFocus: { hasFocus: true, isTouched: u.state.isTouched },
    }));

const onBlurredWhileFocused = (store: FormFieldStore) =>
  store.update$
    .filter(u => FieldActions.blur.isA(u.action))
    .filter(u => u.state.hasFocus)
    .map(u => FieldActions.stateChanged({
      reason: "blur",
      changeFocus: { hasFocus: false, isTouched: true },
    }));

const focusEffects = (store: FormFieldStore) =>
  Observable.merge(
    onFocusWhileBlurred(store),
    onBlurredWhileFocused(store),
  );

/* RESET EFFECTS */

const resetFieldEffects = (store: FormFieldStore) =>
  store.update$
    .filter(u => FieldActions.reset.isA(u.action))
    .map(u => u.state)
    .switchMap(s => {
      let change: FormStateChange = { reason: "reset" };
      if (!s.options.areEqual(s.value, s.options.initialValue, s)) {
        change.changeValue = { value: s.options.initialValue };
      }
      if (s.isTouched) {
        change.changeFocus = { hasFocus: s.hasFocus, isTouched: false };
      }
      if (change.changeFocus || change.changeValue) {
        return Observable.of(FieldActions.stateChanged(change));
      } else {
        return Observable.empty<Action>();
      }
    });

/* UPDATE EFFECTS */

const updateEffects = (store: FormFieldStore) =>
  store.update$
    .filter(u => FieldActions.update.isA(u.action))
    .switchMap(u => {
      const { state: s, action } = u;
      const value = action.payload;
      let change: FormStateChange = { reason: "update" };
      if (!s.options.areEqual(s.value, value, s)) {
        change.changeValue = { value };
        change.changeFocus = { hasFocus: s.hasFocus, isTouched: true };
      }
      if (change.changeFocus || change.changeValue) {
        return Observable.of(FieldActions.stateChanged(change));
      } else {
        return Observable.empty<Action>();
      }
    });

/* SET_DIRTY EFFECTS */
const setDirtyFieldEffects = (store: FormFieldStore) =>
  store.state$
    .distinctUntilChanged((x, y) => x.value === y.value)
    .map(s => !s.options.areEqual(s.value, s.options.initialValue, s))
    .distinctUntilChanged()
    .map(FieldActions.setDirty);

/* STORE */

const FormsFieldReducer = reducerFromActions(FieldActions);
const FormsGroupReducer = reducerFromActions(GroupActions);

export const createFormFieldStore = (
  def: FormFieldDefinition,
  createOptions?: CreateFormStoreOptions,
  storeOptions?: ICreateStoreOptions<CommonFormState>,
) => {
  const state = defaultFieldState(def, createOptions);
  return defineStore<CommonFormState, FormFieldStore>(
    FormsFieldReducer,
    state,
    extendWithActions(FieldActions),
    extendWith(s => ({ value: state.value })),
    withEffects(focusEffects, resetFieldEffects, updateEffects, setDirtyFieldEffects),
  )(storeOptions);
};

export const createFormGroupStore = (
  def: FormGroupDefinition,
  createOptions?: CreateFormStoreOptions,
  storeOptions?: ICreateStoreOptions<CommonFormState>,
) => {
  const state = defaultGroupState(def, createOptions);
  return defineStore<CommonFormState, FormGroupStore>(
    FormsGroupReducer,
    state,
    extendWithActions(GroupActions),
    extendWith(s => ({ value: state.value })),
  )(storeOptions);
};

createFormStoreFunc = (
  def: FormDefinition,
  createOptions?: CreateFormStoreOptions,
  storeOptions?: ICreateStoreOptions<CommonFormState>,
) => {
  if (def.kind === "field") {
    return createFormFieldStore(def, createOptions, storeOptions);
  } else {
    return createFormGroupStore(def, createOptions, storeOptions);
  }
};

export const createFormStore = createFormStoreFunc;
