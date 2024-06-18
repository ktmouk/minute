import { expect, it, describe } from "vitest";
import { ZodError, z } from "zod";
import { contract } from ".";

describe("omitUndefined", () => {
  describe("when an input and an output comply with the contract", () => {
    it("can uses a function", () => {
      const execute = contract(
        {
          input: z.strictObject({
            foo: z.string(),
            bar: z.number(),
          }),
          output: z.strictObject({
            baz: z.string(),
          }),
        },
        ({ foo, bar }) => ({ baz: `${foo}${bar}` }),
      );
      expect(execute({ foo: "foo", bar: 123 })).toStrictEqual({
        baz: "foo123",
      });
    });
  });

  describe("when an input does not comply with the contract", () => {
    it("throws an error", () => {
      const execute = contract(
        {
          input: z.strictObject({
            foo: z.string(),
            bar: z.number(),
          }),
          output: z.strictObject({
            baz: z.string(),
          }),
        },
        ({ foo, bar }) => ({ baz: `${foo}${bar}` }),
      );
      expect(() =>
        // @ts-expect-error throws a type error
        execute({ foo: "foo", bar: "bar" }),
      ).toThrow(ZodError);
    });
  });

  describe("when an input schema is the strictObject and receives unknown prop", () => {
    it("throws an error", () => {
      const execute = contract(
        {
          input: z.strictObject({
            foo: z.string(),
          }),
          output: z.strictObject({
            bar: z.string(),
          }),
        },
        () => ({ bar: "baz" }),
      );
      expect(() =>
        // @ts-expect-error throws a type error
        execute({ foo: "foo", bar: "bar" }),
      ).toThrow(ZodError);
    });
  });

  describe("when an output does not comply with the contract", () => {
    it("throws an error", () => {
      const execute = contract(
        {
          input: z.strictObject({
            foo: z.string(),
            bar: z.number(),
          }),
          output: z.strictObject({
            baz: z.string(),
          }),
        },
        // @ts-expect-error throws a type error
        () => ({ baz: 123 }),
      );
      expect(() => execute({ foo: "foo", bar: 123 })).toThrow(ZodError);
    });
  });

  describe("when an output schema is the strictObject and receives unknown prop", () => {
    it("throws an error", () => {
      const execute = contract(
        {
          input: z.strictObject({
            foo: z.string(),
          }),
          output: z.strictObject({
            bar: z.string(),
          }),
        },
        () => ({ bar: "bar", baz: "baz" }),
      );
      expect(() => execute({ foo: "foo" })).toThrow(ZodError);
    });
  });
});
