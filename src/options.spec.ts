"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");

import {
  mergeOptions, getDefaultTextOptions, getDefaultBoolOptions,
  getGlobalFieldOptions, getGlobalGroupOptions, getFieldTypeOptions,
} from "./options";

describe("mergeOptions", () => {
  describe("Given various options", () => {
    const opt1 = { a: 1, b: "hi", validatorFactories: [1, 2, 3] };
    const opt2 = { c: 2, d: "hello", validatorFactories: [10, 20, 30] };
    const opt3 = { e: 3, f: "world", validatorFactories: ["1", "2", "3"] };
    describe("When mergeOptions is applied", () => {
      const opts = mergeOptions(opt1, opt2, opt3);
      it("target should be as expected",
        () => expect(opts).toEqual({
          a: 1, b: "hi",
          c: 2, d: "hello",
          e: 3, f: "world",
          validatorFactories: [1, 2, 3, 10, 20, 30, "1", "2", "3"],
        }));
    }); // describe When mergeOptions is applied
  }); // describe Given various options
}); // describe mergeOptions

describe("getGlobalFieldOptions", () => {
  describe("Given the default field options", () => {
    const opts = getGlobalFieldOptions();
    it("it should be a distinct object every time",
      () => expect(getGlobalFieldOptions()).not.toBe(opts));
    it("it's title should be empty",
      () => expect(opts.title).toEqual(""));
    it("it's placeholderValue should be empty",
      () => expect(opts.placeholderValue).toBeNull());
    it("it's initialValue should be empty",
      () => expect(opts.initialValue).toBeNull());
    it("it's coerce should not be null",
      () => expect(opts.coerce).not.toBeNull());
    it("it's compare should not be null",
      () => expect(opts.compare).not.toBeNull());
    it("it's isEmpty should not be null",
      () => expect(opts.isEmpty).not.toBeNull());
  }); // describe Given the default text options
}); // describe getGlobalFieldOptions

describe("getDefaultTextOptions", () => {
  describe("Given the default text options", () => {
    const opts = getDefaultTextOptions();
    it("it should be a distinct object every time",
      () => expect(getDefaultTextOptions()).not.toBe(opts));
    it("it's title should be empty",
      () => expect(opts.title).toEqual(""));
    it("it's placeholderValue should be empty",
      () => expect(opts.placeholderValue).toEqual(""));
    it("it's initialValue should be empty",
      () => expect(opts.initialValue).toEqual(""));
    it("it's coerce should not be null",
      () => expect(opts.coerce).not.toBeNull());
    it("it's compare should not be null",
      () => expect(opts.compare).not.toBeNull());
    it("it's isEmpty should not be null",
      () => expect(opts.isEmpty).not.toBeNull());
    it("it's maxLength should be undefined",
      () => expect(opts.maxLength).toBeUndefined());
    it("it's multiline should be false",
      () => expect(opts.multiline).toBe(false));
  }); // describe Given the default text options
}); // describe getDefaultTextOptions

describe("getDefaultBoolOptions", () => {
  describe("Given the default text options", () => {
    const opts = getDefaultBoolOptions();
    it("it should be a distinct object every time",
      () => expect(getDefaultBoolOptions()).not.toBe(opts));
    it("it's title should be empty",
      () => expect(opts.title).toEqual(""));
    it("it's placeholderValue should be empty",
      () => expect(opts.placeholderValue).toEqual(""));
    it("it's initialValue should be empty",
      () => expect(opts.initialValue).toEqual(false));
    it("it's coerce should not be null",
      () => expect(opts.coerce).not.toBeNull());
    it("it's compare should not be null",
      () => expect(opts.compare).not.toBeNull());
    it("it's isEmpty should not be null",
      () => expect(opts.isEmpty).not.toBeNull());
    it("it's threeState should be false",
      () => expect(opts.threeState).toBe(false));
  }); // describe Given the default text options
}); // describe getDefaultBoolOptions

describe("getFieldTypeOptions", () => {
  describe("Given the default text options", () => {
    const opts = getFieldTypeOptions();
    it("it should be a distinct object every time",
      () => expect(getFieldTypeOptions()).not.toBe(opts));
    it("it should be a equal to field defaults",
      () => expect(opts).toEqual({
        text: getDefaultTextOptions(),
        bool: getDefaultBoolOptions(),
      }));
  }); // describe Given the default text options
}); // describe getFieldTypeOptions
