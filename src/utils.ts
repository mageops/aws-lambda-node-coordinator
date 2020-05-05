import {EC2} from 'aws-sdk';

export function flatten<T>(acc: T[], item: T[]): T[] {
    return [...acc, ...item];
}

export function instanceState(state: EC2.InstanceStateName): (item: EC2.Instance) => boolean {
    return (item) => item.State?.Name === state;
}

export function instanceAge(a: EC2.Instance, b: EC2.Instance): number {
    // ?? is not formatted correctly
    // clang-format off
    const aTime = a.LaunchTime ?.getTime() ?? Infinity;
    const bTime = b.LaunchTime ?.getTime() ?? Infinity;
    // clang-format on
    return aTime - bTime;
}

export function exactTag(name: string, value: string): (tag: EC2.Tag) =>
    boolean {
    return (tag) => tag.Key === name && tag.Value === value;
}

export function namedTag(name: string): (tag: EC2.Tag) => boolean {
    return (tag) => tag.Key === name;
}

export function except<T>(fn: (i: T) => boolean): (i: T) => boolean {
    return (i) => !fn(i);
}
