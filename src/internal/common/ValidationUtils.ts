/**
 * @internal
 */
export function isFalsy<T>(value: T): boolean {
    return !value;
}

/**
 * @internal
 */
export function isType<T>(value: T, type: string): boolean {
    return typeof value === type;
}

/**
 * @internal
 */
export function isIncluded<T>(collection: { [s: string]: T; } | ArrayLike<T>, searchElement: T): boolean {
    return Object.values(collection).includes(searchElement);
}