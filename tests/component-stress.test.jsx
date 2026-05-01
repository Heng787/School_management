import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import { DataProvider } from '../context/DataContext';
import { ThemeProvider } from '../context/ThemeContext';

// Stub out matchMedia to prevent issues in testing-library
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('Component Stress Test: Deep Rendering', () => {
  it('should render the entire App tree without crashing under simulated load', () => {
    const start = performance.now();
    const ITERATIONS = 30; // Reduced for testing speed
    
    for(let i=0; i<ITERATIONS; i++) {
        const { unmount } = render(
            <BrowserRouter>
                <DataProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </DataProvider>
            </BrowserRouter>
        );
        unmount();
    }
    const end = performance.now();
    const avgTime = (end - start) / ITERATIONS;
    
    console.log(`Stress Test: Average render time for full <App /> tree: ${avgTime.toFixed(2)}ms`);
    
    // We expect the app to render properly
    expect(avgTime).toBeDefined();
    expect(avgTime).toBeLessThan(1000); // generous threshold for test runner
  });
});
