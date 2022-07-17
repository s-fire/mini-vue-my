import { isReadonly, readonly, isProxy } from "../reactive";
describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped)).toBe(true);
  });
  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });
    user.age = 10;
    expect(console.warn).toBeCalled();
  });
  test("nested readonly", () => {
    const origin = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = readonly(origin);
    expect(isReadonly(observed.nested)).toBe(true);
    expect(isReadonly(observed.array)).toBe(true);
    expect(isReadonly(observed.array[0])).toBe(true);
    expect(isProxy(observed)).toBe(true);
  });
});
