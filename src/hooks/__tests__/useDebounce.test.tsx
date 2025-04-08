import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useDebounce from '../useDebounce';

describe('useDebounce hook', () => {
  // Mock timers for controlled testing
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

    // Initial value is set immediately
    expect(result.current).toBe('initial value');

    // Change the value
    rerender({ value: 'updated value', delay: 500 });

    // Value should not be updated yet because of debounce
    expect(result.current).toBe('initial value');

    // Fast forward time to just before the delay
    jest.advanceTimersByTime(499);
    expect(result.current).toBe('initial value');

    // Fast forward time to trigger the debounce timeout
    jest.advanceTimersByTime(1);
    expect(result.current).toBe('updated value');
  });

  it('should reset the timer when value changes before timeout', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    // Change the value
    rerender({ value: 'updated value 1', delay: 500 });

    // Fast forward halfway
    jest.advanceTimersByTime(250);
    expect(result.current).toBe('initial value');

    // Change the value again before the timeout
    rerender({ value: 'updated value 2', delay: 500 });

    // Fast forward past the first expected timeout
    jest.advanceTimersByTime(250);
    // The first update should be canceled, still waiting on the second
    expect(result.current).toBe('initial value');

    // Fast forward to trigger the second update
    jest.advanceTimersByTime(250);
    expect(result.current).toBe('updated value 2');
  });

  it('should respect changes to delay parameter', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 1000 } }
    );

    // Change value and decrease delay
    rerender({ value: 'updated value', delay: 200 });

    // Advance timer - should update with shorter delay
    jest.advanceTimersByTime(200);
    expect(result.current).toBe('updated value');
  });
}); 