"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");

import { compose, assignIfExists, flatten } from "./utils";

describe("compose", () => {
  it("compose should be a function", () => expect(typeof compose).toBe("function"));
  it("compose(JSON.stringify, ...false) should return true",
    () => expect(compose(JSON.stringify, a => false)("")).toBe("false"));
  it("compose(JSON.stringify, ...true) should return false",
    () => expect(compose(JSON.stringify, a => true)("")).toBe("true"));
}); //    compose

describe("assignIfExists", () => {
  describe("Given a source and target without property name", () => {
    const source = { a: 1, b: "hi" };
    const target = { c: 2, d: "hello" };
    describe("When assignIfExists is applied", () => {
      assignIfExists(target, source, "name");
      it("target should be as expected",
        () => expect(target).toEqual({ c: 2, d: "hello" }));
    }); // describe When assignIfExists is applied
  }); // describe Given a source and target without property name

  describe("Given a source and target with property name only on target",
    () => {
      const source = { a: 1, b: "hi" };
      const target = { c: 2, d: "hello", name: "my name" };
      describe("When assignIfExists is applied", () => {
        assignIfExists(target, source, "name");
        it("target should be as expected",
          () => expect(target).toEqual({
            c: 2, d: "hello", name: "my name"
          }));
      }); // describe When assignIfExists is applied
    }); // describe Given a source and target without property name

  describe("Given a source and target with property name only on source",
    () => {
      const source = { a: 1, b: "hi", name: "my name" };
      const target = { c: 2, d: "hello" };
      describe("When assignIfExists is applied", () => {
        assignIfExists(target, source, "name");
        it("target should be as expected",
          () => expect(target).toEqual({
            c: 2, d: "hello", name: "my name",
          }));
      }); // describe When assignIfExists is applied
    }); // describe Given a source and target without property name

  describe("Given a source and target with property name on both",
    () => {
      const source = { a: 1, b: "hi", name: "my name" };
      const target = { c: 2, d: "hello", name: "is ok" };
      describe("When assignIfExists is applied", () => {
        assignIfExists(target, source, "name");
        it("target should be as expected",
          () => expect(target).toEqual({
            c: 2, d: "hello", name: "my name",
          }));
      }); // describe When assignIfExists is applied
    }); // describe Given a source and target without property name

  describe("Given a coerce function",
    () => {
      const source = { a: 1, b: "hi", name: "my name" };
      const target = { c: 2, d: "hello", name: "is ok" };
      describe("When assignIfExists is applied", () => {
        assignIfExists(target, source, "name", (value: string) => value.length);
        it("target should be as expected",
          () => expect(target).toEqual({
            c: 2, d: "hello", name: 7,
          }));
      }); // describe When assignIfExists is applied
    }); // describe Given a source and target without property name
}); // describe assignIfExists

describe("flatten", () => {
  it("flatten should be a function", () => expect(typeof flatten).toBe("function"));
  describe("When the array is empty", () => {
    it("it should return an empty array",
      () => expect(flatten([])).toEqual([]));
  }); //    When the array is empty
  describe("When the array is already flat", () => {
    it("it should return an equal array",
      () => expect(flatten([1, 2, "a", {}])).toEqual([1, 2, "a", {}]));
  }); //    When the array is already flat
  describe("When the array is a column array", () => {
    it("it should return the flatten array",
      () => expect(flatten([[[[1, 2, "a", {}]]]])).toEqual([1, 2, "a", {}]));
  }); //    When the array is already flat
  describe("When the array forms a tree", () => {
    it("it should return the flatten array",
      () => expect(flatten([1, [2, [3, 4, 5], 6], [7, 8]]))
        .toEqual([1, 2, 3, 4, 5, 6, 7, 8]));
  }); //    When the array is already flat
  describe("When the array forms a tree and wants to flatten one level", () => {
    it("it should return the flatten array",
      () => expect(flatten([1, [2, [3, 4, 5], 6], [7, 8]], false))
        .toEqual([1, 2, [3, 4, 5], 6, 7, 8]));
  }); //    When the array is already flat
}); //    flatten
