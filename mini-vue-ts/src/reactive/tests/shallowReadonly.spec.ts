import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("shallowReadOnly", () => {
    const origin = {
      props: {
        a: 1,
      },
    };
    const observe = shallowReadonly(origin);
    expect(isReadonly(observe)).toBe(true);
    expect(isReadonly(observe.props)).toBe(false);
  });
  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });
    user.age = 10;
    expect(console.warn).toBeCalled();
  });
});
