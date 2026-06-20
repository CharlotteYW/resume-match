'use client'
import {useState} from 'react'

interface MatchResult {
  matchScore: number
  matchingSkills: string[]
  missingSkills: string[]
  suggestions: string[]
  summary: string
}

export default function ResumeMatcher() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyzeResumeMatch() {
 
    setLoading(true)
    setError('')
    try {
        if(!resumeFile) {setError('Please upload your resume file.'); setLoading(false); return}
        if(!jobUrl) {setError('Please enter the job URL.'); setLoading(false); return}

        const formData = new FormData()
        formData.append('resumeFile', resumeFile)
        formData.append('jobUrl', jobUrl)
        const res = await fetch('/api/resume-match', {
            method: 'POST',
            body: formData
        })
        if (!res.ok) throw new Error('Failed to analyze resume')
        setResult(await res.json())
    } catch (err) {
        setError('Something went wrong while analyzing the resume. Please try again.')
    } finally {
        setLoading(false)
    }
    }
    return (
        <section>
            <h1 className="font-bold text-2xl mb-2 tracking-tight">
            Resume <span className="mx-1">&&</span> Job Matcher
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Upload your resume and providethe job URL to see how well they match.
            </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div> 
                <label className="block text-sm font-medium mb-2">Your Resume(PDF)</label>
                    <div className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2">
                        <p  className="text-sm text-neutral-500">{resumeFile ?   resumeFile.name : 'Select a PDF file'}</p>
                        <label className="cursor-pointer px-4 py-2 bg-blue-100 rounded-lg text-sm hover:bg-blue-200">
                            Browse
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Job Description URL</label>
                    <input
                        type="url"
                        className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="https://example.com/job-description"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                    />
                    <p className="text-xs text-neutral-500 mt-1">Works best with Greenhouse and Lever. <br/> LinkedIn and Indeed are not supported.</p>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400"
                onClick={analyzeResumeMatch}
                disabled={loading}
            >
                {loading ? 'Analyzing...' : 'Analyze Match'}
            </button>
            {result && (
                <div className="mt-8 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800">
                    <h2 className="text-xl font-semibold mb-4">Match Result</h2>
                    <p><strong>Match Score:</strong> {result.matchScore}%</p>
                    <p><strong>Summary:</strong> {result.summary}</p>
                    <div className="mt-4">
                        <h3 className="font-semibold">Matching Skills:</h3>
                        <ul className="list-disc list-inside">
                            {result.matchingSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold">Missing Skills:</h3>
                        <ul className="list-disc list-inside">
                            {result.missingSkills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold">Suggestions:</h3>
                        <ul className="list-disc list-inside">
                            {result.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    )
}