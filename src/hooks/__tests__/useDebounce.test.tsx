import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useDebounce from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial value', 500));
    expect(result.current).toBe('initial value');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    expect(result.current).toBe('initial value');

    rerender({ value: 'updated value', delay: 500 });

    expect(result.current).toBe('initial value');

    jest.advanceTimersByTime(499);
    expect(result.current).toBe('initial value');

    jest.advanceTimersByTime(1);
    expect(result.current).toBe('updated value');
  });

  it('should reset the timer when value changes before timeout', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    rerender({ value: 'updated value 1', delay: 500 });

    jest.advanceTimersByTime(250);
    expect(result.current).toBe('initial value');

    rerender({ value: 'updated value 2', delay: 500 });

    jest.advanceTimersByTime(250);
    expect(result.current).toBe('initial value');

    jest.advanceTimersByTime(250);
    expect(result.current).toBe('updated value 2');
  });

  it('should respect changes to delay parameter', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 1000 } }
    );

    rerender({ value: 'updated value', delay: 200 });

    jest.advanceTimersByTime(200);
    expect(result.current).toBe('updated value');
  });
}); 