import React, { useEffect } from 'react'
import './App.css'

// Import Phaser
import 'phaser'
import { gameConfig } from './game/config'

function App() {
  useEffect(() => {
    try {
      // Initialize Phaser
      const game = new Phaser.Game(gameConfig)
      
      // Cleanup on unmount
      return () => {
        game.destroy(true)
      }
    } catch (error) {
      console.error('Failed to initialize Phaser:', error)
    }
  }, [])

  return (
    <div className="App">
      <div id="game-container"></div>
    </div>
  )
}

export default App
