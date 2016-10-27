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
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

import * as deepEqual from "deep-equal";

import {
  reassign, Store, Action, StoreActions, logUpdates, startEffects,
  tunnelActions, ActionTunnel,
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
  FieldActions, GroupActions,
} from "./index";

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
        () => expect(state.value).toBeNull());
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

testActions(FieldActions, "FieldActions",
  expectedActions<FormFieldState>("RxStore@FORMS@FIELD@", actions => {
    actions.typed("stateChanged", "STATE_CHANGED");

    actions.typed("update", "UPDATE");

    actions.empty("blur", "BLUR");

    actions.empty("focus", "FOCUS");

    actions.empty("reset", "RESET");
  })
);

testActions(GroupActions, "GroupActions",
  expectedActions<FormGroupState>("RxStore@FORMS@GROUP@", actions => {
    actions.typed("stateChanged", "STATE_CHANGED");

    actions.empty("reset", "RESET");
  })
);

