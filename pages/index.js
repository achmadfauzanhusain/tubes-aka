'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Calculator, Zap, TrendingUp } from 'lucide-react'
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function Home() {
  const [base, setBase] = useState(2)
  const [exponent, setExponent] = useState(10)

  const [naiveResult, setNaiveResult] = useState(null)
  const [fastResult, setFastResult] = useState(null)
  const [naiveTime, setNaiveTime] = useState(0)
  const [fastTime, setFastTime] = useState(0)

  const [graphData, setGraphData] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // O(n)
  const naiveExponentiation = (a, n, iterations) => {
    const start = performance.now()
    let result = 1

    for (let k = 0; k < iterations; k++) {
      result = 1
      for (let i = 0; i < n; i++) result *= a
    }

    return {
      result,
      time: (performance.now() - start) / iterations,
    }
  }

  // O(log n) — Binary Exponentiation (ITERATIF)
  const fastExponentiation = (a, n, iterations) => {
    const start = performance.now()
    let result = 1

    const pow = (base, exp) => {
      let res = 1
      let b = base
      let e = exp

      while (e > 0) {
        if (e & 1) res *= b
        b *= b
        e >>= 1
      }
      return res
    }

    for (let i = 0; i < iterations; i++) {
      result = pow(a, n)
    }

    return {
      result,
      time: (performance.now() - start) / iterations,
    }
  }

  // HITUNG SATU KASUS
  const calculateSingle = () => {
    if (exponent > 50000) {
      alert('Exponent terlalu besar untuk single hitung')
      return
    }

    const iterations = exponent < 100 ? 10000 : 3000

    const naive = naiveExponentiation(base, exponent, iterations)
    const fast = fastExponentiation(base, exponent, iterations)

    setNaiveResult(naive.result)
    setFastResult(fast.result)
    setNaiveTime(naive.time)
    setFastTime(fast.time)
  }

  // ANALISIS LENGKAP
  const runCompleteAnalysis = async () => {
    setIsAnalyzing(true)
    const sizes = [10, 50, 100, 500, 1000, 2000, 5000, 10000]
    const data = []

    for (const n of sizes) {
      const iterations = n < 1000 ? 2000 : 500

      const naive = naiveExponentiation(base, n, iterations)
      const fast = fastExponentiation(base, n, iterations)

      data.push({
        n,
        naive: +naive.time.toFixed(6),
        fast: +fast.time.toFixed(6),
      })

      setGraphData([...data])
      await new Promise(r => setTimeout(r, 40))
    }

    setIsAnalyzing(false)
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-slate-100 p-8`}>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-6 flex justify-center gap-2">
          <Calculator /> Analisis Algoritma Perpangkatan
        </h1>

        {/* INPUT */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              value={base}
              onChange={e => setBase(+e.target.value)}
              className="border p-2 rounded"
              placeholder="Base"
            />
            <input
              type="number"
              value={exponent}
              onChange={e => setExponent(+e.target.value)}
              className="border p-2 rounded"
              placeholder="Exponent"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={calculateSingle}
              className="flex-1 bg-indigo-600 text-white p-3 rounded"
            >
              <Zap className="inline mr-2" />
              Hitung
            </button>

            <button
              onClick={runCompleteAnalysis}
              disabled={isAnalyzing}
              className="flex-1 bg-green-600 text-white p-3 rounded disabled:bg-gray-400"
            >
              <TrendingUp className="inline mr-2" />
              {isAnalyzing ? 'Menganalisis...' : 'Analisis Lengkap'}
            </button>
          </div>
        </div>

        {/* HASIL HITUNG */}
        {naiveResult !== null && (
          <div className="bg-white p-6 rounded shadow mb-6 grid md:grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Naive (O(n))</h3>
              <p>Hasil: <b>{naiveResult.toExponential(4)}</b></p>
              <p>Waktu: <b>{naiveTime.toFixed(6)} ms</b></p>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Fast (O(log n))</h3>
              <p>Hasil: <b>{fastResult.toExponential(4)}</b></p>
              <p>Waktu: <b>{fastTime.toFixed(6)} ms</b></p>
            </div>

            <div className="md:col-span-2 text-center text-sm text-gray-600">
              Speedup ≈ <b>{(naiveTime / fastTime).toFixed(2)}×</b>
            </div>
          </div>
        )}

        {/* GRAFIK */}
        {graphData.length > 0 && (
          <div className="bg-white p-6 rounded shadow">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="n" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="naive" />
                <Line dataKey="fast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  )
}