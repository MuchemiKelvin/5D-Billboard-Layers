// Simple test component to verify React is working
import { useState } from 'react'

function TestComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-dark text-white">
      <h1 className="text-4xl mb-4">React Test</h1>
      <button
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        onClick={() => setCount(c => c + 1)}
      >
        Count is: {count}
      </button>
    </div>
  )
}

export default TestComponent
