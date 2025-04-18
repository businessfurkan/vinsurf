/**
 * Utility functions for playing sounds in the application
 */

// Function to play a click sound for button and menu interactions
export const playClickSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-light-button-tap-2582.mp3');
  audio.volume = 0.5; // Reduce volume to be less intrusive
  audio.play().catch(error => {
    // Silently handle errors - some browsers require user interaction before playing audio
    console.debug('Could not play sound:', error);
  });
};

// Add more sound utility functions as needed
