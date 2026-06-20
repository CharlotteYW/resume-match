export async function  extractTextFromPDF(buffer: Buffer): Promise<string> {
    const {extractText} =  await import('unpdf') 
    const {text} = await extractText(new Uint8Array(buffer))
    return  text.join('\n')
}