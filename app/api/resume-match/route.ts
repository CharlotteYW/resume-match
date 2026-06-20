import Anthropic from "@anthropic-ai/sdk";
import {extractTextFromPDF} from 'app/lib/pdf-utils'
import {fetchJobFromUrl} from 'app/lib/job-utils'

const client = new Anthropic()

export async function POST(request: Request) {
    try{
        
        const fromData = await request.formData()
        const resumeFile = fromData.get('resumeFile') as File | null
        const jobUrl = fromData.get('jobUrl') as string | null

        if(!resumeFile || resumeFile.size === 0){
            return Response.json({error: 'Resume file is required'}, {status:400})
        }
        if(!jobUrl){
            return Response.json({error: 'Job URL is required'}, {status:400})
        }

        const resumeBuffer = await resumeFile.arrayBuffer()
        const resume = await extractTextFromPDF(Buffer.from(resumeBuffer))
        const jobDescription = await fetchJobFromUrl(jobUrl)


        const message = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens:1024,
            messages:[{
                
                    role:'user',
                    content: `You are a professional resume reviewer. Analyze how well this resume match the job description. 
                    
                    Resume: ${resume}

                    Job Description: ${jobDescription}
                    
                    Response in JSON format only, no markdown, no code blocks:
                    {
                    "matchScore": <number 0-100>,
                    "matchingSkills": [<list of skills that match the job description>],
                    "missingSkills": [<list of skills that are required by the job description but not mentioned in the resume>],
                    "suggestions": [<list of suggestions to improve the resume to better match the job description>],
                    "summary": <a brief summary of how well the resume matches the job description>
            }`
                }]
 
            
        })
        const content = message.content[0]
        if (content.type !== 'text') throw new Error('Unexpected content type from Claude API')

        const cleaned = content.text.replace(/```json/g, '').replace(/```/g, '').trim()

        const result = JSON.parse(cleaned)
        return Response.json(result)

    } catch (error) {
        console.error('Claude API error:', error)
        return Response.json({ error: 'Failed to analyze resume' }, { status: 500 })
    }

}