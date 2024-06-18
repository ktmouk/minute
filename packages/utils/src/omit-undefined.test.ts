import { expect, it, describe } from "vitest";
import { omitUndefined } from ".";

describe("omitUndefined", () => {
  describe("when it has undefined values", () => {
    it("removes props", () => {
      expect(
        omitUndefined({
          foo: "foo",
          bar: undefined,
          baz: undefined,
        }),
      ).toStrictEqual({
        foo: "foo",
      });
    });
  });

  describe("when it has the null value", () => {
    it("does not remove a prop", () => {
      expect(
        omitUndefined({
          foo: null,
        }),
      ).toStrictEqual({
        foo: null,
      });
    });
  });

  describe("when it has the zero value", () => {
    it("does not remove a prop", () => {
      expect(
        omitUndefined({
          foo: 0,
        }),
      ).toStrictEqual({
        foo: 0,
      });
    });
  });

  describe("when it has the false value", () => {
    it("does not remove a prop", () => {
      expect(
        omitUndefined({
          foo: false,
        }),
      ).toStrictEqual({
        foo: false,
      });
    });
  });

  describe("when it has nested props", () => {
    it("does not remove nested props", () => {
      expect(
        omitUndefined({
          bar: undefined,
          foo: {
            bar: "bar",
            baz: undefined,
          },
        }),
      ).toStrictEqual({
        foo: {
          bar: "bar",
          baz: undefined,
        },
      });
    });
  });
});
