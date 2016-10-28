"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import { queue } from "rxjs/scheduler/queue";
import "rxjs/add/observable/concat";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/do";
import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
import "rxjs/add/operator/observeOn";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

import * as deepEqual from "deep-equal";

import {
  reassign, Store, Action, StoreActions, logUpdates, startEffects,
  tunnelActions, ActionTunnel, withEffects,
} from "rxstore";
import { successResult } from "rxvalidation";
import { testActions, expectedActions } from "rxstore-jest";
import {
  testUpdateEffects, testActionEffects, testStateEffects,
  expectAction, expectItem, testLastStateEffects,
} from "rxstore-jest";

import {
  field, group, defaultFieldState, defaultGroupState,
  getDefaultTextOptions, FormGroupState, FormFieldState,
  FieldActions, GroupActions, FormStateChange,
  createFormStore, createFormFieldStore, createFormGroupStore,
  FormStore, FormFieldStore, FormGroupStore,
} from "./index";

const sampleField = field("text");
const initTextField = defaultFieldState(sampleField);
const helloTextField = reassign(initTextField, { value: "hello" });
const focusedTextField = reassign(initTextField, { hasFocus: true, isTouched: true, isUntouched: false });
const focusedUntouchedTextField = reassign(initTextField, { hasFocus: true, isTouched: true, isUntouched: false });
const touchedTextField = reassign(initTextField, { hasFocus: false, isTouched: true, isUntouched: false });
const dirtyTextField = reassign(initTextField, { isDirty: true, isPristine: false });
const finalTextField = reassign(initTextField,
  { value: "hello" },
  { hasFocus: true, isTouched: true, isUntouched: false },
  { isDirty: true, isPristine: false },
);

const initGroupValue = { firstName: "John", lastName: "Smith", age: 18 };
const finalGroupValue = { firstName: "George", lastName: "St-Pierre", age: 35 };
const sampleGroup = defaultGroupState(group({
  firstName: field("text", { initialValue: "John" }),
  lastName: field("text", { initialValue: "Smith" }),
  age: field("int", { initialValue: 18 }),
}));
const initGroup = reassign(sampleGroup, { value: initGroupValue });
const changedGroup = reassign(initGroup, { value: finalGroupValue });
const focusedGroup = reassign(initGroup, { hasFocus: true, isTouched: true, isUntouched: false });
const touchedGroup = reassign(initGroup, { hasFocus: false, isTouched: true, isUntouched: false });
const dirtyGroup = reassign(initGroup, { isDirty: true, isPristine: false });
const finalGroup = reassign(initGroup,
  { value: finalGroupValue },
  { hasFocus: true, isTouched: true, isUntouched: false },
  { isDirty: true, isPristine: false },
);

describe("defaultFieldState", () => {
  describe("Given a simple form field definition", () => {
    const def = field("text");
    describe("When a default state is created", () => {
      const state = defaultFieldState(def);
      it("it should be an instance of FormFieldState",
        () => expect(state.kind).toBe("field"));
      if (state.kind !== "field") { return; }
      it("its options should be equal to default text options",
        () => expect(state.options).toEqual(getDefaultTextOptions()));
      it("its type should be as expected",
        () => expect(state.type).toBe(def.type));
      it("its value should be as expected",
        () => expect(state.value).toBe(""));
      it("it should be valid",
        () => expect(state.isValid).toBe(true));
      it("it should not be invalid",
        () => expect(state.isInvalid).toBe(false));
      it("it should not be pending",
        () => expect(state.isPending).toBe(false));
      it("its pending count should be zero",
        () => expect(state.pendingCount).toBe(0));
      it("it should not be dirty",
        () => expect(state.isDirty).toBe(false));
      it("it should be pristine",
        () => expect(state.isPristine).toBe(true));
      it("it should not be touched",
        () => expect(state.isTouched).toBe(false));
      it("it should be untouched",
        () => expect(state.isUntouched).toBe(true));
      it("it should not have focus",
        () => expect(state.hasFocus).toBe(false));
      it("it should have no errors",
        () => expect(state.errors).toEqual(successResult()));
    }); // describe When a default state is created
  }); // describe Given a simple form field definition
}); // describe defaultFieldState

describe("defaultGroupState", () => {
  describe("Given a simple form group definition", () => {
    const def = group({
      firstName: field("text", { initialValue: "John" }),
      lastName: field("text", { initialValue: "Smith" }),
      age: field("int", { initialValue: 18 }),
    });
    describe("When a default state is created", () => {
      const state = defaultGroupState(def);
      it("it should be an instance of FormGroupState",
        () => expect(state.kind).toBe("group"));
      if (state.kind !== "group") { return; }
      it("its value should be as expected",
        () => expect(state.value).toEqual({ firstName: "John", lastName: "Smith", age: 18 }));
      it("its children should have three instances",
        () => expect(Object.keys(state.children).length).toBe(3));
      it("it should be valid",
        () => expect(state.isValid).toBe(true));
      it("it should not be invalid",
        () => expect(state.isInvalid).toBe(false));
      it("it should not be pending",
        () => expect(state.isPending).toBe(false));
      it("its pending count should be zero",
        () => expect(state.pendingCount).toBe(0));
      it("it should not be dirty",
        () => expect(state.isDirty).toBe(false));
      it("it should be pristine",
        () => expect(state.isPristine).toBe(true));
      it("it should not be touched",
        () => expect(state.isTouched).toBe(false));
      it("it should be untouched",
        () => expect(state.isUntouched).toBe(true));
      it("it should not have focus",
        () => expect(state.hasFocus).toBe(false));
      it("it should have no errors",
        () => expect(state.errors).toEqual(successResult()));
    }); // describe When a default state is created
  }); // describe Given a simple form group definition
}); // describe defaultGroupState

describe("Test actions", () => {
  testActions(FieldActions, "FieldActions",
    expectedActions<FormFieldState>("RxStore@FORMS@FIELD@", actions => {
      actions.typed("stateChanged", "STATE_CHANGED")
        .withSample(initTextField, {}, initTextField)
        .withSample(initTextField, { changeValue: { value: "hello" } }, helloTextField)
        .withSample(helloTextField, { changeValue: { value: "" } }, initTextField)
        .withSample(initTextField, { changeFocus: { hasFocus: true, isTouched: true } }, focusedTextField)
        .withSample(initTextField, { changeFocus: { hasFocus: false, isTouched: true } }, touchedTextField)
        .withSample(initTextField, { changeDirty: { isDirty: true } }, dirtyTextField)
        .withSample(dirtyTextField, { changeDirty: { isDirty: false } }, initTextField)
        .withSample(initTextField,
        {
          changeValue: { value: "hello" },
          changeFocus: { hasFocus: true, isTouched: true },
          changeDirty: { isDirty: true },
        }, finalTextField)
        .withSample(finalTextField,
        {
          changeValue: { value: "" },
          changeFocus: { hasFocus: false, isTouched: false },
          changeDirty: { isDirty: false },
        }, initTextField)
        ;

      actions.typed("update", "UPDATE");

      actions.empty("blur", "BLUR");

      actions.empty("focus", "FOCUS");

      actions.empty("reset", "RESET");
    })
  );

  testActions(GroupActions, "GroupActions",
    expectedActions<FormGroupState>("RxStore@FORMS@GROUP@", actions => {
      actions.typed("stateChanged", "STATE_CHANGED")
        .withSample(initGroup, {}, initGroup)
        .withSample(initGroup, { changeValue: { value: finalGroupValue } }, changedGroup)
        .withSample(changedGroup, { changeValue: { value: initGroupValue } }, initGroup)
        .withSample(initGroup, { changeFocus: { hasFocus: true, isTouched: true } }, focusedGroup)
        .withSample(initGroup, { changeFocus: { hasFocus: false, isTouched: true } }, touchedGroup)
        .withSample(initGroup, { changeDirty: { isDirty: true } }, dirtyGroup)
        .withSample(dirtyGroup, { changeDirty: { isDirty: false } }, initGroup)
        .withSample(initGroup,
        {
          changeValue: { value: finalGroupValue },
          changeFocus: { hasFocus: true, isTouched: true },
          changeDirty: { isDirty: true },
        }, finalGroup)
        .withSample(finalGroup,
        {
          changeValue: { value: initGroupValue },
          changeFocus: { hasFocus: false, isTouched: false },
          changeDirty: { isDirty: false },
        }, initGroup)
        ;

      actions.empty("reset", "RESET");
    })
  );
}); //    Test actions

describe("Test field effects", () => {
  const testFieldEffects = (
    given: { given: string, init: FormFieldState },
    when: { when: string, action: Action },
    expectations: { expect: string, change: FormStateChange | undefined },
  ) => {
    describe(given.given, () => {
      describe(when.when, () => {
        it(expectations.expect, () => {
          const store = createFormFieldStore(sampleField, undefined, {
            init: given.init,
            middlewaresAfter: [
              // logUpdates({ logger: console.info, caption: given.given }),
            ],
          });
          const promise = store.action$
            .filter(FieldActions.stateChanged.isA)
            .map(a => a.payload as FormStateChange)
            .takeUntil(Observable.interval(40))
            .takeLast(1)
            .toArray()
            .toPromise() as PromiseLike<FormStateChange[]>;
          store.dispatch(when.action);
          return promise.then(changes => {
            if (expectations.change) {
              // expect(changes.length).toBe(1);
              // expect(changes[0]).toEqual(expectations.change);
              expect(changes).toEqual([expectations.change]);
            } else {
              expect(changes).toEqual([]);
            }
          });
        });
      }); //    When a focus action is dispatched
    });
  };

  describe("Focus", () => {
    testFieldEffects( // untouched + focus -> focused/untouched
      { given: "Given an untouched field store", init: initTextField },
      { when: "When a focus action is dispatched", action: FieldActions.focus() },
      {
        expect: "it should emit a change to update the focus status",
        change: { changeFocus: { hasFocus: true, isTouched: false }, reason: "focus" },
      });

    testFieldEffects( // touched + focus -> focused/touched
      { given: "Given a touched field store", init: touchedTextField },
      { when: "When a focus action is dispatched", action: FieldActions.focus() },
      {
        expect: "it should emit a change to update the focus status",
        change: { changeFocus: { hasFocus: true, isTouched: true }, reason: "focus" },
      });

    testFieldEffects( // focused + focus -> []
      { given: "Given a focused field store", init: focusedTextField },
      { when: "When a focus action is dispatched", action: FieldActions.focus() },
      {
        expect: "it should not emit any change to update the focus status",
        change: undefined,
      });

    testFieldEffects( // untouched + blur -> untouched
      { given: "Given an untouched field store", init: initTextField },
      { when: "When a blur action is dispatched", action: FieldActions.blur() },
      {
        expect: "it should emit a change to update the focus status",
        change: undefined,
      });

    testFieldEffects( // touched + blur -> touched
      { given: "Given a touched field store", init: touchedTextField },
      { when: "When a blur action is dispatched", action: FieldActions.blur() },
      {
        expect: "it should emit a change to update the focus status",
        change: undefined,
      });

    testFieldEffects( // focused + blur -> touched
      { given: "Given a focused field store", init: focusedTextField },
      { when: "When a blur action is dispatched", action: FieldActions.blur() },
      {
        expect: "it should not emit any change to update the focus status",
        change: { changeFocus: { hasFocus: false, isTouched: true }, reason: "blur" },
      });
  }); //    Focus

  describe("Reset", () => {
    testFieldEffects( // (untouched, pristine, default) + reset -> (untouched, pristine, default) 
      { given: "Given an untouched field store", init: initTextField },
      { when: "When a reset action is dispatched", action: FieldActions.reset() },
      {
        expect: "it should not emit any change",
        change: undefined,
      });

    testFieldEffects( // (touched, pristine, default) + reset -> (untouched, pristine, default)
      { given: "Given an touched field store", init: touchedTextField },
      { when: "When a reset action is dispatched", action: FieldActions.reset() },
      {
        expect: "it should emit a change to reflect a reset state",
        change: {
          changeFocus: { hasFocus: false, isTouched: false },
          reason: "reset",
        },
      });

    testFieldEffects( // (focused, pristine, default) + reset -> (focused/untouched, pristine, default)
      { given: "Given a focused field store", init: focusedTextField },
      { when: "When a reset action is dispatched", action: FieldActions.reset() },
      {
        expect: "it should emit a change to reflect a reset state",
        change: {
          changeFocus: { hasFocus: true, isTouched: false },
          reason: "reset",
        },
      });

    testFieldEffects( // (untouched, dirty, default) + reset -> (untouched, pristine, default) 
      { given: "Given a dirty field store", init: dirtyTextField },
      { when: "When a reset action is dispatched", action: FieldActions.reset() },
      {
        expect: "it should make the state pristine again",
        change: {
          changeDirty: { isDirty: false },
          reason: "reset",
        },
      });
  }); //    Reset
}); //    Test effects
